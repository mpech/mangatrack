const assert = require('assert')
const utils = require('../../utils')
const Mocker = require('../../../lib/mocker')
const UserModel = require('../../../models/userModel')
const AtModel = require('../../../models/oauth/atModel')

utils.bindApp()
describe('e2e/me/me', function () {
  beforeEach(utils.clearColls([UserModel, AtModel]))

  it('returns me', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId })
    ])

    const { body: { id, displayName, admin } } = await utils.requester
      .get('/me')
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)

    assert.strictEqual(id, userId)
    assert.strictEqual(displayName, 'moran')
    assert.strictEqual(admin, true)
  }))
})
