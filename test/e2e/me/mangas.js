var utils = require('../../utils')
var Mocker = require('../../../lib/mocker')
var MangaModel = require('../../../models/mangaModel')
var UserModel = require('../../../models/userModel')
var AtModel = require('../../../models/oauth/atModel')

utils.bindApp()
describe('e2e me/mangas', function () {
  beforeEach(utils.clearColls([MangaModel, AtModel, UserModel]))

  it('authenticate and set a manga', Mocker.mockIt(function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    return Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran' }),
      AtModel.create({ token, userId })
    ]).then(u => {
      return utils.requester
        .put('/me/mangas/dbz')
        .set({ Authorization: 'Bearer ' + token })
        .expect(200)
    })
  }))

  it('does not authenticate and set a manga', Mocker.mockIt(function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    return Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran' }),
      AtModel.create({ token, userId })
    ]).then(u => {
      return utils.requester
        .put('/me/mangas/dbz')
        .set({ Authorization: 'Bearer a' })
        .expect(503)
    })
  }))
})
