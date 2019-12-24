var assert = require('assert')
var utils = require('../utils/')
var UserModel = require('../../models/userModel')
var Mocker = require('../../lib/mocker')

utils.bindDb()
describe('models/userModel', function () {
  beforeEach(utils.clearColls([UserModel]))

  it('finds a user for sure', Mocker.mockIt(function (mokr) {
    return UserModel.create({ displayName: 'a' }).then(u => {
      return UserModel.findOneForSure({ displayName: 'a' })
    }).then(u => {
      assert(u)
    })
  }))

  it('throws if not found', Mocker.mockIt(function (mokr) {
    let thrown = false
    return UserModel.create({ displayName: 'a' }).then(u => {
      return UserModel.findOneForSure({ googleId: 2 })
    }).catch(e => {
      thrown = true
      assert.strictEqual(e.status, 404)
    }).then(_ => {
      assert(thrown)
    })
  }))
})
