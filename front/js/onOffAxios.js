class OnOffAxios {
  constructor (store) {
    this.$store = store
  }

  _forward (verb, axiosArgs, bypass) {
    const args = [...axiosArgs]
    if (this.$store.getters.accessToken) {
      if (args.length !== 2 && !bypass) {
        throw new Error(`unhandled case: expects payload for ${verb}`)
      }
      // axios ought to be configured beforehand anyway
      args.push({
        headers: {
          Authorization: `Bearer ${this.$store.getters.accessToken}`
        }
      })
      return axios[verb].apply(axios, args).catch(e => {
        throw new Error(e)
      })
    }
    return this._local(args[1])
  }

  _local (data) {
    return Promise.resolve({ data })
  }

  get () {
    const args = arguments
    if (args.length >= 2) {
      throw new Error('poor design, expects GET to only present url as arguments')
    }
    return this._forward('get', args, true)
  }

  put () {
    const args = arguments
    return this._forward('put', args)
  }

  patch () {
    const args = arguments
    return this._forward('patch', args)
  }

  delete () {
    const args = arguments
    return this._forward('delete', args, true)
  }
}
export default OnOffAxios
