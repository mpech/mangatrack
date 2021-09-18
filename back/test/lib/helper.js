const assert = require('assert')
const helper = require('../../lib/helper')
const Mocker = require('../../lib/mocker')
const OauthService = require('../../services/oauth')
const UserModel = require('../../models/userModel')

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
    const userId = '0'.repeat(24)
    const at = 'a'.repeat(40)
    let called = false
    mokr.mock(OauthService, 'getAccessToken', async token => {
      assert.strictEqual(token, at)
      return { user: { id: userId } }
    })
    mokr.mock(UserModel, 'findOneForSure', async () => {
      called = true
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
    return helper.authenticate({ headers: { authorization: `Bearer ${at}`} }, res).then(() => {
      assert(called)
    })
  }))
})
