const assert = require('assert')
const utils = require('../../utils')
const Mocker = require('../../../lib/mocker')
const MangaModel = require('../../../models/mangaModel')
const ChapterModel = require('../../../models/chapterModel')
const UserModel = require('../../../models/userModel')
const AtModel = require('../../../models/oauth/atModel')

utils.bindApp()
describe('e2e/me/mangas', function () {
  beforeEach(utils.clearColls([MangaModel, ChapterModel, AtModel, UserModel]))

  it('authenticate and set a manga', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    const dbz = '1'.repeat(24)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran' }),
      MangaModel.upsertManga({
        _id: dbz,
        name: 'dbz',
        lastChap_num: 5,
        chapters: [{ num: 5, url: 'xx' }]
      }, 'mangakakalot'),
      AtModel.create({ token, userId })
    ])

    const { body: { mangaId, num } } = await utils.requester
      .put(`/me/mangas/${dbz}`)
      .send({ num: 5 })
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)

    assert.strictEqual(mangaId, dbz)
    assert.strictEqual(num, 5)
    const u = await UserModel.findOne({ _id: userId })
    assert.strictEqual(u.mangas.get(dbz).num, 5)
  }))

  it('rejects if not existing manga', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran' }),
      MangaModel.create({ _id: '1'.repeat(24), name: 'b' }),
      AtModel.create({ token, userId })
    ])

    return utils.requester
      .put(`/me/mangas/${'1'.repeat(24)}`)
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
      .put(`/me/mangas/${'1'.repeat(24)}`)
      .set({ Authorization: 'Bearer a' })
      .expect(401)
  }))

  it('deletes a manga', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas: { ['1'.repeat(24)]: { num: 5 } } }),
      AtModel.create({ token, userId })
    ])

    await utils.requester
      .delete(`/me/mangas/${'1'.repeat(24)}`)
      .set({ Authorization: `Bearer ${at.token}` })
      .expect(200)

    const u = await UserModel.findOne({ _id: userId })
    assert.strictEqual(u.mangas.size, 1)
  }))

  it('patches my manga collection', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'

    const ignored = '0'.repeat(24)
    const notOverridenIfInferior = '7'.repeat(24)
    const overriden = '5'.repeat(24)
    const mangas = {
      [ignored]: { num: 1 },
      [notOverridenIfInferior]: { num: 7, updatedAt: 10 },
      [overriden]: { num: 5, updatedAt: 2 }
    }
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas }),
      AtModel.create({ token, userId }),
      MangaModel.create({ _id: ignored, name: 'ignored', chapters: [{ num: mangas[ignored], url: 'xx' }] }),
      MangaModel.upsertManga({
        _id: notOverridenIfInferior,
        name: 'notOverridenIfInferior',
        chapters: [
          { num: 5, url: 'x' },
          { num: 7, url: 'x' }
        ]
      }, 'fanfox'),
      MangaModel.upsertManga({
        _id: overriden,
        name: 'overriden',
        chapters: [
          { num: 5, url: 'x' },
          { num: 6, url: 'x' }
        ]
      }, 'fanfox')
    ])
    await utils.requester
      .patch('/me/mangas')
      .set({ Authorization: `Bearer ${at.token}` })
      .send({
        items: [
          { mangaId: notOverridenIfInferior, num: 5, updatedAt: 8 },
          { mangaId: overriden, num: 6, updatedAt: 3 }
        ]
      })
      .expect(200)

    const u = await UserModel.findOne({ _id: userId })
    assert.strictEqual(u.mangas.get(notOverridenIfInferior).num, 7)
    assert.strictEqual(u.mangas.get(overriden).num, 6)
  }))

  it('gives me back my failing mangas', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    const failingOnes = '1'.repeat(24)
    const failingTwos = '2'.repeat(24)
    const dbz = '0'.repeat(24)
    const ccc = '4'.repeat(24)
    const mangas = {
      [dbz]: { num: 5 },
      ['1'.repeat(24)]: { num: 7 },
      ['2'.repeat(24)]: { num: 5 },
      [ccc]: { num: 3 }
    }
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas }),
      AtModel.create({ token, userId }),
      MangaModel.upsertManga({ _id: dbz, name: 'dbz', chapters: [{ num: mangas[dbz].num, url: 'a' }] }, 'fanfox'),
      MangaModel.upsertManga({ _id: ccc, name: 'ccc', chapters: [{ num: mangas[ccc].num, url: 'a' }] }, 'fanfox')
    ])

    const { body } = await utils.requester
      .patch('/me/mangas')
      .set({ Authorization: `Bearer ${at.token}` })
      .send({
        items: [
          { mangaId: failingOnes, num: 5, updatedAt: Date.now() },
          { mangaId: failingTwos, num: 1, updatedAt: Date.now() },
          { mangaId: ccc, num: 5, updatedAt: Date.now() }
        ]
      })
      .expect(400)
    assert.strictEqual(body.reason, `unknown mangas(${failingOnes},${failingTwos})`)
  }))

  it('rejects if unknown num', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    const dbz = '0'.repeat(24)
    const ccc = '1'.repeat(24)
    const mangas = {
      [dbz]: { num: 1 },
      [ccc]: { num: 2 }
    }
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas }),
      AtModel.create({ token, userId }),
      MangaModel.upsertManga({ _id: dbz, name: 'dbz', chapters: [{ num: 1, url: 'a' }] }, 'fanfox'),
      MangaModel.upsertManga({ _id: ccc, name: 'ccc', chapters: [{ num: 2, url: 'a' }] }, 'fanfox')
    ])

    const { body } = await utils.requester
      .patch('/me/mangas')
      .set({ Authorization: `Bearer ${at.token}` })
      .send({
        items: [
          { mangaId: dbz, num: 3, updatedAt: Date.now() },
          { mangaId: ccc, num: 4, updatedAt: Date.now() }
        ]
      })
      .expect(400)
    assert.strictEqual(body.reason, `unknown chapters([{"mangaId":"${dbz}","num":3},{"mangaId":"${ccc}","num":4}])`)
  }))

  it('rejects if no array', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran' }),
      AtModel.create({ token: 'abc', userId })
    ])
    await utils.requester
      .patch('/me/mangas')
      .set({ Authorization: `Bearer ${at.token}` })
      .send({
        items: []
      })
      .expect(400)
  }))

  it('fetches my collection', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    const dbz = '0'.repeat(24)
    const ccc = '4'.repeat(24)
    const mangas = {
      [dbz]: { num: 5 },
      ['1'.repeat(24)]: { num: 7 },
      ['2'.repeat(24)]: { num: 5 },
      [ccc]: { num: 3 }
    }
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas }),
      AtModel.create({ token, userId })
    ])
    const { body: { items } } = await utils.requester
      .get('/me/mangas')
      .set({ Authorization: `Bearer ${at.token}` })
      .expect(200)

    assert.strictEqual(items.length, 4)
    assert.strictEqual(items[0].mangaId, dbz)
    assert.strictEqual(items[0].num, 5)
    assert.strictEqual(items[3].mangaId, ccc)
    assert.strictEqual(items[3].num, 3)
  }))

  it('fetches my collection with populated manga', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    const dbz = '0'.repeat(24)
    const mangas = {
      [dbz]: { num: 5 }
    }
    const [, at] = await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', mangas }),
      AtModel.create({ token, userId }),
      MangaModel.create({ _id: dbz, name: 'gro', lastChap_at: 5, lastChap_num: 6 })
    ])
    const { body: { items: [item] } } = await utils.requester
      .get('/me/mangas?populated=true')
      .set({ Authorization: `Bearer ${at.token}` })
      .expect(200)

    assert.deepEqual(item.manga, {
      id: '000000000000000000000000',
      name: 'gro',
      nameId: 'gro',
      lastChap: { num: 6, at: 5 }
    })
  }))
})
