import OnOffAxios from '../../../src/libs/onOffAxios'

it('gets an oauthToken if expiration and forwards', async () => {
  const store = {
    getters: {
      accessToken: 'expired'
    },
    async dispatch (name) {
      expect(name).toBe('refreshToken')
      store.getters.accessToken = 'renewed'
    }
  }
  let nbCall = 0
  const onOffAxios = new OnOffAxios(store)
  onOffAxios.axios.get = async function (route, opts) {
    if (nbCall === 0) {
      nbCall++
      expect(opts.headers.Authorization).toBe('Bearer expired')
      const e = new Error()
      e.response = { data: { error: 'invalid_token' } }
      return Promise.reject(e)
    }
    expect(opts.headers.Authorization).toBe('Bearer renewed')
    // retry has been made
    nbCall++
    return { response: { data: [] } }
  }
  await onOffAxios.get('/xx')
  expect(nbCall).toBe(2)
})
