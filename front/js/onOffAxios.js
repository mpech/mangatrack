class OnOffAxios {
  constructor (store) {
    this.$store = store
  }

  _forward (verb, args) {
    args = [...args]
    let fallback = true
    if (typeof (args[args.length - 1]) === 'function') {
      fallback = args.pop()
    }

    if (this.$store.getters.accessToken) {
      // axios ought to be configured beforehand anyway
      args.push({
        headers: {
          Authorization: `Bearer ${this.$store.getters.accessToken}`
        }
      })
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

  get () {
    return this._forward('get', arguments)
  }

  put () {
    return this._forward('put', arguments)
  }

  patch () {
    return this._forward('patch', arguments)
  }

  delete () {
    return this._forward('delete', arguments)
  }
}
export default OnOffAxios
