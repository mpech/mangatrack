import config from '../../config/index.js'
import utils from '../utils/index.js'
import assert from 'assert'
import Mocker from '../../lib/mocker.js'
import AtModel from '../../models/oauth/atModel.js'
import RtModel from '../../models/oauth/rtModel.js'
import UserModel from '../../models/userModel.js'
import passport from 'passport'

utils.bindApp()
describe('e2e/oauth', function () {
  beforeEach(utils.clearColls([UserModel, AtModel, RtModel]))

  it('generates token on callback', Mocker.mockIt(async function (mokr) {
    mokr.mock(passport, 'authenticate', (endpointName, _, cb) => {
      assert.strictEqual(endpointName, 'google')
      return function (req, res) {
        return cb(null, { id: '123', displayName: 'Seichiro Kitano' })
      }
    })
    const now = Date.now()
    const { headers } = await utils.requester
      .get('/oauth/google/callback')
      .expect(302)

    assert(headers.location.includes('access_token'))
    assert(headers.location.includes('refresh_token'))
    assert(!headers.location.includes('undefined'))

    const u = await UserModel.findOne({ googleId: { $exists: true } })
    assert(u.googleId.includes('123'))
    assert.strictEqual(u.displayName, 'Seichiro Kitano')

    return Promise.all([
      AtModel.findOne({ userId: u._id }).then(c => {
        assert(c)
        const duration = c.expiresAt.getTime() - now
        assert(Math.abs(duration - config.oauth_accessToken_duration) < 1000)
      }),
      RtModel.findOne({ userId: u._id }).then(c => {
        assert(c)
        const duration = c.expiresAt.getTime() - now
        assert(Math.abs(duration - config.oauth_refreshToken_duration) < 1000)
      })
    ])
  }))

  it('generates token on callback with redirect', Mocker.mockIt(function (mokr) {
    mokr.mock(passport, 'authenticate', (endpointName, _, cb) => {
      assert.strictEqual(endpointName, 'google')
      return function (req, res) {
        return cb(null, { id: '123', displayName: 'Seichiro Kitano' })
      }
    })
    return utils.requester
      .get('/oauth/google/callback?state=https://login')
      .expect(302)
      .then(function (res) {
        assert(res.headers.location.includes('access_token'))
        assert(res.headers.location.includes('refresh_token'))
        assert(res.headers.location.startsWith('https://login'))
      })
  }))

  it('renew a token', Mocker.mockIt(async function (mokr) {
    const rt = await RtModel.create({
      token: 'a'.repeat(40),
      userId: '0'.repeat(24)
    })
    const { body } = await utils.requester
      .post('/oauth/token')
      .set({
        'content-type': 'application/x-www-form-urlencoded'
      }).send({
        grant_type: 'refresh_token',
        refresh_token: rt.token
      })
      .expect(200)
    return Promise.all([
      RtModel.findOne({ token: rt.token }).then(x => assert(!x)),
      RtModel.findOne({ token: body.refresh_token }).then(x => assert(x)),
      AtModel.findOne({ token: body.access_token }).then(x => assert(x))
    ])
  }))
})
