import config from '../../config/index.js'
import utils from '../utils/index.js'
import assert from 'assert'
import Mocker from '../../lib/mocker.js'
import MangaModel from '../../models/mangaModel.js'

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
    await MangaModel.create({ name: 'a', lastChap_num: 0, lastChap_at: 1, lastChap_url: 'a' })

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
      MangaModel.create({ name: 'a', lastChap_at: 0 }),
      MangaModel.create({ name: 'b', lastChap_at: 5 }),
      MangaModel.create({ name: 'c', lastChap_at: 1 })
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
      MangaModel.create({ name: 'a', lastChap_at: 0 }),
      MangaModel.create({ name: 'b', lastChap_at: 5 }),
      MangaModel.create({ name: 'c', lastChap_at: 1 })
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
      MangaModel.create({ name: 'aaaaaa', lastChap_at: 0 }),
      MangaModel.create({ name: 'abaaaa', lastChap_at: 5 }),
      MangaModel.create({ name: 'abcabc', lastChap_at: 5 })
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
      MangaModel.create({ _id: '0'.repeat(24), name: 'aaaaaa', lastChap_at: 0 }),
      MangaModel.create({ _id: '1'.repeat(24), name: 'abaaaa', lastChap_at: 5 }),
      MangaModel.create({ _id: '2'.repeat(24), name: 'abcabc', lastChap_at: 5 })
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
      MangaModel.create({ _id: '0'.repeat(24), name: 'aaaaaa', lastChap_at: 0 }),
      MangaModel.create({ _id: '1'.repeat(24), name: 'abaaaa', lastChap_at: 5 }),
      MangaModel.create({ _id: '2'.repeat(24), name: 'abcabc', lastChap_at: 5 })
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
      MangaModel.upsertManga({
        name: 'def',
        chapters: [{ num: 0, url: 'a', at: 3 }, { num: 1, url: 'b', at: 4 }],
        description: 'c',
        thumbUrl: 'thumb'
      }, 'mangakakalot')
    ])

    const { body } = await utils.requester
      .get('/mangas/def')
      .expect(200)

    assert.strictEqual(body.thumbUrl, 'thumb')
    assert.strictEqual(body.description.content, 'c')
    assert.strictEqual(body.description.from, 'mangakakalot')
    const items = body.chapters
    assert.strictEqual(items.length, 1)
    assert.strictEqual(body.name, 'def')
    const { from, chapters } = items[0]
    assert.strictEqual(from, 'mangakakalot')
    assert.strictEqual(chapters.length, 2)
    assert.strictEqual(chapters[0].url, 'b')
    assert.strictEqual(chapters[0].num, 1)
    assert.strictEqual(chapters[0].at, 4)
    assert.strictEqual(chapters[1].url, 'a')
    assert.strictEqual(chapters[1].num, 0)
    assert.strictEqual(chapters[1].at, 3)
  }))

  it('filters mangas by min chapters', Mocker.mockIt(async function (mokr) {
    await Promise.all([
      MangaModel.create({ _id: '0'.repeat(24), name: 'aaaaaa', lastChap_at: 1, lastChap_num: 10 }),
      MangaModel.create({ _id: '1'.repeat(24), name: 'abaaaa', lastChap_at: 2, lastChap_num: 5 }),
      MangaModel.create({ _id: '2'.repeat(24), name: 'abcabc', lastChap_num: 2 })
    ])
    const { body: { items } } = await utils.requester
      .get('/mangas?minChapters=5')
      .expect(200)

    assert.strictEqual(items.length, 2)
    assert.strictEqual(items[0].name, 'abaaaa')
    assert.strictEqual(items[1].name, 'aaaaaa')
  }))

  it('list one manga by id', Mocker.mockIt(async function (mokr) {
    const manga = await MangaModel.create({ name: 'abc' })
    const { body } = await utils.requester
      .get('/mangas/' + manga.id)
      .expect(200)

    assert.strictEqual(body.name, 'abc')
  }))

  describe('list by tags', () => {
    it('filter if only one tag', async () => {
      const [a] = await Promise.all([
        MangaModel.create({ name: 'abc', tags: ['kr'] }),
        MangaModel.create({ name: 'def', tags: ['jn'] })
      ])
      const { body: { items } } = await utils.requester
        .get('/mangas?tags=kr')
        .expect(200)

      assert.strictEqual(items.length, 1)
      assert.strictEqual(items[0].name, a.name)
    })

    it('filter if several tags', async () => {
      const [a, b] = await Promise.all([
        MangaModel.create({ name: 'abc', tags: ['kr'], lastChap_at: 0 }),
        MangaModel.create({ name: 'def', tags: ['cn'], lastChap_at: 1 }),
        MangaModel.create({ name: 'ghi', tags: ['jn'] })
      ])
      const { body: { items } } = await utils.requester
        .get('/mangas?tags=kr&tags=cn')
        .expect(200)

      assert.strictEqual(items.length, 2)
      assert.strictEqual(items[0].name, b.name)
      assert.strictEqual(items[1].name, a.name)
    })

    it('rejects if invalid tag', () => {
      return utils.requester
        .get('/mangas?tags=tt')
        .expect(400)
    })
  })
})
