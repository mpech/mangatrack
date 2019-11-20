const assert = require('assert')
const utils = require('../../utils')
const Mocker = require('../../../lib/mocker')
const MangaModel = require('../../../models/mangaModel')
const UserModel = require('../../../models/userModel')
const AtModel = require('../../../models/oauth/atModel')

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
        .send({ num: 5 })
        .set({ Authorization: 'Bearer ' + token })
        .expect(200)
      .then(({ body:{ nameId, num } }) => {
        assert.equal(nameId, 'dbz')
        assert.equal(num, 5)
      })
    }).then(_=>{
      return UserModel.findOne({ _id: userId }).then(u => {
        assert.strictEqual(u.mangas.get('dbz'), 5)
      })
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
        .expect(401)
    })
  }))

  it('deletes a manga', Mocker.mockIt(function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    return Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas:{ dbz: 5 } }),
      AtModel.create({ token, userId })
    ]).then(([u, at]) => {
      return utils.requester
        .delete('/me/mangas/dbz')
        .set({ Authorization: `Bearer ${at.token}` })
        .expect(200)
    }).then(_ => {
      return UserModel.findOne({ _id: userId}).then(u => {
        assert(!u.mangas.has('dbz'))
      })
    })
  }))
})
