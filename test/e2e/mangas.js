var config = require('../../config')
var utils = require('../utils')
var assert = require('assert')
var Mocker = require('../../lib/mocker')
var MangaModel = require('../../models/mangaModel')

utils.bindApp()
describe('e2e mangas', function () {
  beforeEach(utils.clearColls([MangaModel]))

  it('lists mangas', Mocker.mockIt(async function (mokr) {
    const { body } = await utils.requester
      .get('/mangas')
      .expect(200)

    assert.strictEqual(body.items.length, 0)
  }))

  it('lists mangas with one existing', Mocker.mockIt(async function (mokr) {
    await MangaModel.create({ name: 'a' })

    const { body } = await utils.requester
      .get('/mangas')
      .expect(200)

    assert.strictEqual(body.items.length, 1)
    const item = body.items[0]
    assert.strictEqual(item.name, 'a')
  }))

  it('lists mangas with one existing and a chapter', Mocker.mockIt(async function (mokr) {
    await MangaModel.create({ name: 'a', chapters: [{ url: 'a', num: 0, at: 1 }] })

    const { body } = await utils.requester
      .get('/mangas')
      .expect(200)

    assert.strictEqual(body.items.length, 1)
    const item = body.items[0]
    assert.strictEqual(item.name, 'a')
    assert(item.lastChap)
    const chap = item.lastChap
    assert.strictEqual(chap.url, 'a')
    assert.strictEqual(chap.num, 0)
    assert.strictEqual(chap.at, 1)
  }))

  it('paginates mangas, limit 1', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ name: 'a', updatedAt: 0 }),
      MangaModel.create({ name: 'b', updatedAt: 5 }),
      MangaModel.create({ name: 'c', updatedAt: 1 })
    ])
    mokr.mock(config, 'pagination_limit', 1)

    const { body } = await utils.requester
      .get('/mangas?offset=0')
      .expect(200)

    assert.strictEqual(body.items.length, 1)
    const item = body.items[0]
    assert.strictEqual(item.name, 'b')
  }))

  it('paginates mangas, skip 1, limit 2', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ name: 'a', updatedAt: 0 }),
      MangaModel.create({ name: 'b', updatedAt: 5 }),
      MangaModel.create({ name: 'c', updatedAt: 1 })
    ])
    mokr.mock(config, 'pagination_limit', 2)

    const { body } = await utils.requester
      .get('/mangas?offset=1')
      .expect(200)

    assert.strictEqual(body.items.length, 2)
    assert.strictEqual(body.items[0].name, 'c')
    assert.strictEqual(body.items[1].name, 'a')
  }))

  it('paginates mangas, filters by name', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ name: 'aaaaaa', updatedAt: 0 }),
      MangaModel.create({ name: 'abaaaa', updatedAt: 5 }),
      MangaModel.create({ name: 'abcabc', updatedAt: 5 })
    ])

    const { body } = await utils.requester
      .get('/mangas?name=aaa')
      .expect(200)

    assert.strictEqual(body.items.length, 2)
    assert.strictEqual(body.items[0].name, 'abaaaa')
    assert.strictEqual(body.items[1].name, 'aaaaaa')
  }))

  it('lists chapters', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ name: 'abc' }),
      MangaModel.create({ name: 'def', chapters: [{ num: 0, url: 'a', at: 3 }, { num: 1, url: 'b', at: 4 }] })
    ])

    const { body } = await utils.requester
      .get('/mangas/def/chapters')
      .expect(200)

    assert.strictEqual(body.items.length, 2)
    assert.strictEqual(body.items[0].url, 'a')
    assert.strictEqual(body.items[0].num, 0)
    assert.strictEqual(body.items[0].at, 3)
    assert.strictEqual(body.items[1].url, 'b')
    assert.strictEqual(body.items[1].num, 1)
    assert.strictEqual(body.items[1].at, 4)
  }))
})
