const assert = require('assert')
const utils = require('../utils/')
const oauth = require('../../services/oauth')
const AtModel = require('../../models/oauth/atModel')
const RtModel = require('../../models/oauth/rtModel')
const errorHandler = require('../../lib/errorHandler')

utils.bindDb()
describe('services/oauth', function () {
  beforeEach(utils.clearColls([AtModel, RtModel]))
  describe('getRefreshToken', () => {
    it('get one', async function () {
      const userId = '0'.repeat(24)
      await RtModel.create({ userId, token: 'a', expiresAt: new Date(1000) })
      const res = await oauth.getRefreshToken('a')
      assert.strictEqual(res.refreshToken, 'a')
      assert.strictEqual(res.refreshTokenExpiresAt.getTime(), 1000)
      assert.strictEqual(res.user.id, userId)
      assert.strictEqual(typeof (res.user.id), 'string')
    })
    it('rejects if none', async function () {
      await assert.rejects(() => oauth.getRefreshToken('a'), { id: errorHandler.invalidTokenError.id })
    })
  })

  describe('revokeToken', () => {
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
  })

  describe('getAccessToken', () => {
    it('getAccessToken', async function () {
      const userId = '0'.repeat(24)
      await AtModel.create({ userId, token: '1000' })
      const at = await oauth.getAccessToken(1000)
      assert.strictEqual(at.accessToken, '1000')
      assert(at.user.id === userId)
    })
    it('rejects if none', async function () {
      assert.rejects(() => oauth.getAccessToken(1000), { id: errorHandler.invalidTokenError.id })
    })
  })

  describe('generateTokens', () => {
    it('get at and rt', async function () {
      const { accessToken, refreshToken } = await oauth.generateTokens({ id: '0'.repeat(24) })
      assert(accessToken.length > 10)
      assert(refreshToken.length > 10)
      assert(accessToken !== refreshToken)
    })
  })
})
