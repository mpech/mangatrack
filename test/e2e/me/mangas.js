const assert = require('assert')
const utils = require('../../utils')
const Mocker = require('../../../lib/mocker')
const MangaModel = require('../../../models/mangaModel')
const UserModel = require('../../../models/userModel')
const AtModel = require('../../../models/oauth/atModel')

utils.bindApp()
describe('e2e me/mangas', function () {
  beforeEach(utils.clearColls([MangaModel, AtModel, UserModel]))

  it('authenticate and set a manga', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran' }),
      MangaModel.create({ name: 'dbz' }),
      AtModel.create({ token, userId })
    ])

    const { body: { nameId, num } } = await utils.requester
      .put('/me/mangas/dbz')
      .send({ num: 5 })
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)

    assert.strictEqual(nameId, 'dbz')
    assert.strictEqual(num, 5)
    const u = await UserModel.findOne({ _id: userId })
    assert.strictEqual(u.mangas.get('dbz'), 5)
  }))

  it('rejects if not existing manga', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran' }),
      MangaModel.create({ name: 'b' }),
      AtModel.create({ token, userId })
    ])

    return utils.requester
      .put('/me/mangas/dbz')
      .send({ num: 5 })
      .set({ Authorization: 'Bearer ' + token })
      .expect(404)
  }))

  it('does not authenticate and set a manga', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran' }),
      AtModel.create({ token, userId })
    ])
    return utils.requester
      .put('/me/mangas/dbz')
      .set({ Authorization: 'Bearer a' })
      .expect(401)
  }))

  it('deletes a manga', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas: { dbz: 5 } }),
      AtModel.create({ token, userId })
    ])

    await utils.requester
      .delete('/me/mangas/dbz')
      .set({ Authorization: `Bearer ${at.token}` })
      .expect(200)

    const u = await UserModel.findOne({ _id: userId })
    assert(!u.mangas.has('dbz'))
  }))

  it('patches my manga collection', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    const mangas = {
      dbz: 5,
      untouched: 7,
      bbb: 5,
      ccc: 3
    }
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas }),
      AtModel.create({ token, userId }),
      MangaModel.create({ name: 'dbz' }),
      MangaModel.create({ name: 'untouched' }),
      MangaModel.create({ name: 'bbb' }),
      MangaModel.create({ name: 'ccc' })
    ])
    await utils.requester
      .patch('/me/mangas')
      .set({ Authorization: `Bearer ${at.token}` })
      .send({
        items: [
          { nameId: 'untouched', num: 5 },
          { nameId: 'bbb', num: -1 },
          { nameId: 'ccc', num: 5 }
        ]
      })
      .expect(200)

    const u = await UserModel.findOne({ _id: userId })
    assert.strictEqual(u.mangas.get('untouched'), 7)
    assert.strictEqual(u.mangas.get('bbb'), -1)
    assert.strictEqual(u.mangas.get('ccc'), 5)
  }))

  it('gives me back my failing mangas', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    const mangas = {
      dbz: 5,
      untouched: 7,
      bbb: 5,
      ccc: 3
    }
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas }),
      AtModel.create({ token, userId }),
      MangaModel.create({ name: 'dbz' }),
      MangaModel.create({ name: 'ccc' })
    ])

    const { body } = await utils.requester
      .patch('/me/mangas')
      .set({ Authorization: `Bearer ${at.token}` })
      .send({
        items: [
          { nameId: 'untouched', num: 5 },
          { nameId: 'bbb', num: -1 },
          { nameId: 'ccc', num: 5 }
        ]
      })
      .expect(400)

    assert.strictEqual(body.reason, 'unknown mangas(untouched,bbb)')
  }))

  it('fetches my collection', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    const mangas = {
      dbz: 5,
      untouched: 7,
      bbb: 5,
      ccc: 3
    }
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas }),
      AtModel.create({ token, userId }),
      MangaModel.create({ name: 'e' }),
      MangaModel.create({ name: 'ccc' })
    ])
    const { body: { items } } = await utils.requester
      .get('/me/mangas')
      .set({ Authorization: `Bearer ${at.token}` })
      .expect(200)

    assert.strictEqual(items.length, 4)
    assert.strictEqual(items[0].nameId, 'dbz')
    assert.strictEqual(items[0].num, 5)
    assert.strictEqual(items[3].nameId, 'ccc')
    assert.strictEqual(items[3].num, 3)
  }))
})
