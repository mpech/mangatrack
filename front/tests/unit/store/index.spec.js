import { actions } from '../../../src/store/index'

it('refreshToken fails implies logout ', async () => {
  let called = false
  const commit = (name, toks) => {
    expect(name).toBe('logout')
    called = true
  }
  const axios = {
    async raw (x) {
      const e = new Error()
      e.response = { data: { error: 'some error' } }
      return Promise.reject(e)
    }
  }
  await actions.refreshToken.call({ axios }, { commit, state: {} })
  expect(called).toBe(true)
})
