var assert = require('assert')
var utils = require('../utils/')
var oauth = require('../../services/oauth')
var AtModel = require('../../models/oauth/atModel')
var RtModel = require('../../models/oauth/rtModel')

utils.bindDb()
describe('services oauth', function () {
  beforeEach(utils.clearColls([AtModel, RtModel]))

  it('getRefreshToken', function () {
    const userId = '0'.repeat(24)
    return RtModel.create({ userId, token: 'a', expiresAt: new Date(1000) }).then(_ => {
      return oauth.getRefreshToken('a').then(res => {
        assert.strictEqual(res.refreshToken, 'a')
        assert.strictEqual(res.refreshTokenExpiresAt.getTime(), 1000)
        assert.strictEqual(res.user.id, userId)
        assert.strictEqual(typeof (res.user.id), 'string')
      })
    })
  })

  it('saveToken', function () {
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
    return oauth.saveToken(token, client, user).then(tok => {
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

      return Promise.all(dfds).then(_ => tok)
    }).then(tok => {
      assert.strictEqual(tok.accessToken, 'a')
      assert.strictEqual(tok.accessTokenExpiresAt.getTime(), new Date(1000).getTime())
      assert.strictEqual(tok.refreshToken, 'b')
      assert.strictEqual(tok.refreshTokenExpiresAt.getTime(), new Date(1001).getTime())
      assert.strictEqual(tok.client, client)
      assert(tok.user.id === user.id)
      assert.strictEqual(tok.scope, token.scope)
    })
  })

  it('revokeToken indeed', function () {
    const userId = '0'.repeat(24)
    return RtModel.create({ token: 'a', userId }).then(rt => {
      return oauth.revokeToken({ refreshToken: 'a', user: { id: userId } }).then(count => {
        assert.strictEqual(count, 1)
      })
    })
  })

  it('revokeToken but no token found', function () {
    const userId = '0'.repeat(24)
    return RtModel.create({ token: 'b', userId }).then(rt => {
      return oauth.revokeToken({ refreshToken: 'a', user: { id: userId } }).then(count => {
        assert.strictEqual(count, 0)
      })
    })
  })

  it('revokeToken but no user found', function () {
    const userId = '0'.repeat(24)
    return RtModel.create({ token: 'b', userId }).then(rt => {
      return oauth.revokeToken({ refreshToken: 'a', user: { id: '1'.repeat(24) } }).then(count => {
        assert.strictEqual(count, 0)
      })
    })
  })

  it('getClient', function () {
    return oauth.getClient('mangatrack', 'xx').then(x => {
      assert(x.accessTokenLifetime)
      assert(x.refreshTokenLifetime)
    })
  })

  it('getAccessToken', function () {
    const userId = '0'.repeat(24)
    return AtModel.create({ userId, token: '1000' }).then(_ => {
      return oauth.getAccessToken(1000).then(at => {
        assert.strictEqual(at.accessToken, '1000')
        assert(at.user.id === userId)
      })
    })
  })

  it('generates token', function () {
    return oauth.generateTokens({ id: '0'.repeat(24) }).then(({ accessToken, refreshToken }) => {
      assert(accessToken.length > 10)
      assert(refreshToken.length > 10)
      assert(accessToken !== refreshToken)
    })
  })
})
