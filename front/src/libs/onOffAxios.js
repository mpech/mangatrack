import axios from 'axios'

class OnOffAxios {
  constructor (store) {
    this.$store = store
    this.axios = axios
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
        last.headers = Object.assign(headers, last.headers)
      } else {
        args[args.length - 1].headers = headers
      }
    } else {
      args.push({ headers })
    }
  }

  _forward (verb, iArgs, opts = { retry: false }) {
    const args = [...iArgs]
    let fallback = true
    if (typeof (args[args.length - 1]) === 'function') {
      fallback = args.pop()
    }

    if (this.$store.getters.accessToken || args[args.length - 1].anonAllowed) {
      if (this.$store.getters.accessToken) {
        const headers = {
          Authorization: `Bearer ${this.$store.getters.accessToken}`
        }
        if (['post', 'put', 'patch'].includes(verb)) {
          if (args.length === 2) {
            // push args not to merge conf to data
            args.push({ headers })
          } else {
            this._mergeOrPush(args, headers)
          }
        } else {
          this._mergeOrPush(args, headers)
        }
      }
      return this.axios[verb].apply(this.axios, args).catch(({ response }) => {
        const e = response.data
        // last condition not necessary IF refreshToken action does not called _forward
        // let as is in case
        if (e.error &&
          (e.error === 'invalid_token' ||
            (e.error === 'server_error' && e.error_description === 'Unauthorized')
          ) && !opts.retry && !iArgs[0].includes('/oauth')) {
          return this.$store.dispatch('refreshToken').then(_ => {
            return this._forward(verb, iArgs, { retry: true })
          })
        }
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

  post () {
    return this._forward('post', arguments)
  }

  raw (verb, ...args) {
    return this.axios[verb](...args)
  }
}
export default OnOffAxios
