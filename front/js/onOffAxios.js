class OnOffAxios {
  constructor (store) {
    this.$store = store
  }

  _forward (verb, axiosArgs) {
    const args = [...axiosArgs]
    if (this.$store.getters.accessToken) {
      if (args.length !== 2) {
        throw new Error('unhandled case: expects payload')
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
    // The GET does not concern unauthenticated flows but offline flows
    // Treat the offline/online. Maybe.
    // For now just fail if you can't get anything
    // instead of taking the localStorage
    return axios.get(axios, arguments)
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
    return this._forward('delete', args)
  }
}
export default OnOffAxios
