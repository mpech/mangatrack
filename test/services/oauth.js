var assert = require('assert')
var utils = require('../utils/')
var oauth = require('../../services/oauth')
var AtModel = require('../../models/oauth/atModel')
var RtModel = require('../../models/oauth/rtModel')

utils.bindDb()
describe('services/oauth', function () {
  beforeEach(utils.clearColls([AtModel, RtModel]))

  it('getRefreshToken', async function () {
    const userId = '0'.repeat(24)
    await RtModel.create({ userId, token: 'a', expiresAt: new Date(1000) })
    const res = await oauth.getRefreshToken('a')
    assert.strictEqual(res.refreshToken, 'a')
    assert.strictEqual(res.refreshTokenExpiresAt.getTime(), 1000)
    assert.strictEqual(res.user.id, userId)
    assert.strictEqual(typeof (res.user.id), 'string')
  })

  it('saveToken', async function () {
    const token = {
      accessToken: 'a',
      accessTokenExpiresAt: new Date(1000),
      refreshToken: 'b',
      refreshTokenExpiresAt: new Date(1001),
      scope: 'profile'
    }
    const client = {
      id: 'mangatrack'
    }
    const user = {
      id: '0'.repeat(24)
    }
    const tok = await oauth.saveToken(token, client, user)
    const dfds = [
      AtModel.findOne({ token: 'a' }).then(at => {
        assert.strictEqual(at.expiresAt.getTime(), new Date(1000).getTime())
        assert(at.userId.equals('0'.repeat(24)))
      }),
      RtModel.findOne({ token: 'b' }).then(rt => {
        assert.strictEqual(rt.expiresAt.getTime(), new Date(1001).getTime())
        assert(rt.userId.equals('0'.repeat(24)))
      })
    ]
    await Promise.all(dfds)
    assert.strictEqual(tok.accessToken, 'a')
    assert.strictEqual(tok.accessTokenExpiresAt.getTime(), new Date(1000).getTime())
    assert.strictEqual(tok.refreshToken, 'b')
    assert.strictEqual(tok.refreshTokenExpiresAt.getTime(), new Date(1001).getTime())
    assert.strictEqual(tok.client, client)
    assert(tok.user.id === user.id)
    assert.strictEqual(tok.scope, token.scope)
  })

  it('revokeToken indeed', async function () {
    const userId = '0'.repeat(24)
    await RtModel.create({ token: 'a', userId })
    const count = await oauth.revokeToken({ refreshToken: 'a', user: { id: userId } })
    assert.strictEqual(count, 1)
  })

  it('revokeToken but no token found', async function () {
    const userId = '0'.repeat(24)
    await RtModel.create({ token: 'b', userId })
    const count = await oauth.revokeToken({ refreshToken: 'a', user: { id: userId } })
    assert.strictEqual(count, 0)
  })

  it('revokeToken but no user found', async function () {
    const userId = '0'.repeat(24)
    await RtModel.create({ token: 'b', userId })
    const count = await oauth.revokeToken({ refreshToken: 'a', user: { id: '1'.repeat(24) } })
    assert.strictEqual(count, 0)
  })

  it('getClient', async function () {
    const x = await oauth.getClient('mangatrack', 'xx')
    assert(x.accessTokenLifetime)
    assert(x.refreshTokenLifetime)
  })

  it('getAccessToken', async function () {
    const userId = '0'.repeat(24)
    await AtModel.create({ userId, token: '1000' })
    const at = await oauth.getAccessToken(1000)
    assert.strictEqual(at.accessToken, '1000')
    assert(at.user.id === userId)
  })

  it('generates token', async function () {
    const { accessToken, refreshToken } = await oauth.generateTokens({ id: '0'.repeat(24) })
    assert(accessToken.length > 10)
    assert(refreshToken.length > 10)
    assert(accessToken !== refreshToken)
  })
})
