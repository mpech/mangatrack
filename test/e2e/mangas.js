var config = require('../../config')
var utils = require('../utils')
var assert = require('assert')
var Mocker = require('../../lib/mocker')
var MangaModel = require('../../models/mangaModel')

utils.bindApp()
describe('e2e/mangas', function () {
  beforeEach(utils.clearColls([MangaModel]))

  it('lists mangas', Mocker.mockIt(async function (mokr) {
    const { body: { items } } = await utils.requester
      .get('/mangas')
      .expect(200)

    assert.strictEqual(items.length, 0)
  }))

  it('lists mangas with one existing', Mocker.mockIt(async function (mokr) {
    await MangaModel.create({ name: 'a' })

    const { body: { items } } = await utils.requester
      .get('/mangas')
      .expect(200)

    assert.strictEqual(items.length, 1)
    const item = items[0]
    assert.strictEqual(item.name, 'a')
  }))

  it('makes an https link by forwarding proto', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ name: 'a' }),
      MangaModel.create({ name: 'b' })
    ])

    const { body } = await utils.requester
      .get('/mangas?limit=1')
      .set('x-forwarded-proto', 'https')
      .expect(200)

    assert(body.links.next.startsWith('https'))
  }))

  it('lists mangas with one existing and a chapter', Mocker.mockIt(async function (mokr) {
    await MangaModel.create({ name: 'a', chapters: [{ url: 'a', num: 0, at: 1 }] })

    const { body: { items } } = await utils.requester
      .get('/mangas')
      .expect(200)

    assert.strictEqual(items.length, 1)
    const item = items[0]
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

    const { body: { items } } = await utils.requester
      .get('/mangas?offset=0')
      .expect(200)

    assert.strictEqual(items.length, 1)
    const item = items[0]
    assert.strictEqual(item.name, 'b')
  }))

  it('paginates mangas, skip 1, limit 2', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ name: 'a', updatedAt: 0 }),
      MangaModel.create({ name: 'b', updatedAt: 5 }),
      MangaModel.create({ name: 'c', updatedAt: 1 })
    ])
    mokr.mock(config, 'pagination_limit', 2)

    const { body: { items } } = await utils.requester
      .get('/mangas?offset=1')
      .expect(200)

    assert.strictEqual(items.length, 2)
    assert.strictEqual(items[0].name, 'c')
    assert.strictEqual(items[1].name, 'a')
  }))

  it('paginates mangas, filters by q', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ name: 'aaaaaa', updatedAt: 0 }),
      MangaModel.create({ name: 'abaaaa', updatedAt: 5 }),
      MangaModel.create({ name: 'abcabc', updatedAt: 5 })
    ])

    const { body: { items } } = await utils.requester
      .get('/mangas?q=aaa')
      .expect(200)

    assert.strictEqual(items.length, 2)
    assert.strictEqual(items[0].name, 'abaaaa')
    assert.strictEqual(items[1].name, 'aaaaaa')
  }))

  it('filters mangas by id', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ _id: '0'.repeat(24), name: 'aaaaaa', updatedAt: 0 }),
      MangaModel.create({ _id: '1'.repeat(24), name: 'abaaaa', updatedAt: 5 }),
      MangaModel.create({ _id: '2'.repeat(24), name: 'abcabc', updatedAt: 5 })
    ])

    const { body: { items } } = await utils.requester
      .get(`/mangas?id=${'0'.repeat(24)}&id=${'2'.repeat(24)}`)
      .expect(200)

    assert.strictEqual(items.length, 2)
    assert.strictEqual(items[0].name, 'abcabc')
    assert.strictEqual(items[1].name, 'aaaaaa')
  }))

  it('filters mangas by id', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ _id: '0'.repeat(24), name: 'aaaaaa', updatedAt: 0 }),
      MangaModel.create({ _id: '1'.repeat(24), name: 'abaaaa', updatedAt: 5 }),
      MangaModel.create({ _id: '2'.repeat(24), name: 'abcabc', updatedAt: 5 })
    ])

    const { body: { items } } = await utils.requester
      .get(`/mangas?id=${'0'.repeat(24)}`)
      .expect(200)

    assert.strictEqual(items.length, 1)
    assert.strictEqual(items[0].name, 'aaaaaa')
  }))

  it('list one manga', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ name: 'abc' }),
      MangaModel.create({ name: 'def', chapters: [{ num: 0, url: 'a', at: 3 }, { num: 1, url: 'b', at: 4 }] })
    ])

    const { body } = await utils.requester
      .get('/mangas/def')
      .expect(200)

    const items = body.chapters
    assert.strictEqual(body.name, 'def')
    assert.strictEqual(items.length, 2)
    assert.strictEqual(items[0].url, 'a')
    assert.strictEqual(items[0].num, 0)
    assert.strictEqual(items[0].at, 3)
    assert.strictEqual(items[1].url, 'b')
    assert.strictEqual(items[1].num, 1)
    assert.strictEqual(items[1].at, 4)
  }))
})
