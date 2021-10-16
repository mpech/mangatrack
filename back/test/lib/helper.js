import assert from 'assert'
import helper from '../../lib/helper.js'
import Mocker from '../../lib/mocker.js'
import OauthService from '../../services/oauth.js'

describe('lib/helper', function () {
  describe('authenticate', () => {
    it('rejects if no Authorization header', () => {
      let called = false
      const res = {
        status: n => {
          assert.strictEqual(n, 400)
          return res
        },
        send: s => {
          assert.strictEqual(s, 'invalid_client')
          called = true
          return res
        }
      }
      return helper.authenticate({ headers: {} }, res).then(() => {
        assert(called)
      })
    })
  })
  it('rejects if no user found', Mocker.mockIt(mokr => {
    const at = 'a'.repeat(40)
    let called = false
    mokr.mock(OauthService, 'getUserFromToken', async token => {
      assert.strictEqual(token, at)
      throw new Error('not found')
    })
    const res = {
      status: n => {
        assert.strictEqual(n, 400)
        return res
      },
      send: s => {
        assert.strictEqual(s, 'unauthorized_client')
        called = true
        return res
      }
    }
    return helper.authenticate({ headers: { authorization: `Bearer ${at}` } }, res).then(() => {
      assert(called)
    })
  }))
})
