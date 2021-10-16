import assert from 'assert'
import utils from '../utils/index.js'
import oauth from '../../services/oauth.js'
import AtModel from '../../models/oauth/atModel.js'
import RtModel from '../../models/oauth/rtModel.js'
import UserModel from '../../models/userModel.js'
import errorHandler from '../../lib/errorHandler.js'

utils.bindDb()
describe('services/oauth', function () {
  beforeEach(utils.clearColls([AtModel, RtModel, UserModel]))
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

  describe('generateTokens', () => {
    it('get at and rt', async function () {
      const { accessToken, refreshToken } = await oauth.generateTokens({ id: '0'.repeat(24) })
      assert(accessToken.length > 10)
      assert(refreshToken.length > 10)
      assert(accessToken !== refreshToken)
    })
  })

  describe('getUserFromToken', () => {
    it('gets the user', async function () {
      const userId = '0'.repeat(24)
      await Promise.all([
        UserModel.create({ displayName: 'a', _id: userId }),
        AtModel.create({ userId, token: '1000' })
      ])
      const user = await oauth.getUserFromToken('1000')
      assert.strictEqual(user._id.toString(), userId)
    })
    it('throws if no token', async function () {
      assert.rejects(() => oauth.getUserFromToken('1000'), { id: errorHandler.invalidTokenError.id })
    })
    it('throws if no user', async function () {
      await AtModel.create({ userId: '0'.repeat(24), token: '1000' })
      assert.rejects(() => oauth.getUserFromToken('1000'), { id: errorHandler.invalidTokenError.id })
    })
  })
})
