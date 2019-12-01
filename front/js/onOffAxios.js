class OnOffAxios {
  constructor (store) {
    this.$store = store
  }

  /**
   * If last arg of args is not an object, add it the headers
   * Else merge headers to last arg of args
   * do NOT override header if already present
   */
  _mergeOrPush (args, headers) {
    if (typeof (args[args.length - 1]) === 'object') {
      const last = args[args.length - 1]
      if (last.headers) {
        Object.keys(headers).forEach(k => {
          if (!last.headers[k]) {
            last.headers[k] = headers.headers[k]
          }
        })
      } else {
        args[args.length - 1].headers = headers.headers
      }
    } else {
      args.push(headers)
    }
  }

  _forward (verb, args) {
    args = [...args]
    let fallback = true
    if (typeof (args[args.length - 1]) === 'function') {
      fallback = args.pop()
    }

    if (this.$store.getters.accessToken || args[args.length - 1].anonAllowed) {
      if (this.$store.getters.accessToken) {
        const headers = {
          headers: {
            Authorization: `Bearer ${this.$store.getters.accessToken}`
          }
        }
        if (['post', 'put', 'patch'].includes(verb)) {
          if (args.length === 2) {
            // push args not to merge conf to data
            args.push(headers)
          } else {
            this._mergeOrPush(args, headers)
          }
        } else {
          this._mergeOrPush(args, headers)
        }
      }

      return axios[verb].apply(axios, args).catch(e => {
        console.log('failed', verb, args, fallback, e)
        throw new Error(e)
      })
    }

    return typeof (fallback) === 'function' ? fallback() : this._local(args[1], args)
  }

  _local (data, verb, args) {
    if (!data) {
      throw new Error(`expect payload or fallback when not authenticated for ${JSON.stringify(args)}`)
    }
    return Promise.resolve({ data })
  }

  async _follow (url, payload, onitems) {
    const { data } = await this._forward('get', [url, payload])
    onitems(data.items)
    if (data.links && data.links.next) {
      return this._follow(data.links.next, payload, onitems)
    }
  }

  get () {
    return this._forward('get', arguments)
  }

  async getAll (url, payload, fallback) {
    const items = []
    let fallbacked = false
    const args = [...arguments]
    if (fallback) {
      args[args.length - 1] = _ => {
        fallbacked = true
        return fallback(arguments)
      }
    }
    const { data } = await this._forward('get', args)
    if (fallbacked) {
      return data
    }
    items.push(...data.items)
    if (data.links.next) {
      const p = payload = { anonAllowed: payload.anonAllowed }
      await this._follow(data.links.next, p, its => {
        items.push(...its)
      })
    }
    return { data: { items } }
  }

  delete () {
    return this._forward('delete', arguments)
  }

  put () {
    return this._forward('put', arguments)
  }

  patch () {
    return this._forward('patch', arguments)
  }
}
export default OnOffAxios
