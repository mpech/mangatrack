import assert from 'assert'
import utils from '../utils/index.js'
import MangaModel from '../../models/mangaModel.js'
import ChapterModel from '../../models/chapterModel.js'
import Mocker from '../../lib/mocker.js'
import ctx from '../../lib/ctx.js'
import errorHandler from '../../lib/errorHandler.js'

utils.bindDb()
describe('models/mangaModel.js', function () {
  beforeEach(utils.clearColls([MangaModel, ChapterModel]))

  it('keeps domain while using mongoose', Mocker.mockIt(function (mokr) {
    ctx.enable()
    const run = function (str) {
      return ctx.initContext(_ => {
        ctx.set('id', str)
        return MangaModel.create({ name: 'test' + str }).then(p => {
          const o = ctx.get()
          assert.strictEqual(o.id, str)
          return MangaModel.findOne().then(q => {
            const o = ctx.get()
            assert.strictEqual(o.id, str)
          })
        }).then(_ => {
          const o = ctx.get()
          assert.strictEqual(o.id, str)
        })
      })
    }
    return Promise.all([
      run('a'),
      run('b')
    ]).finally(_ => {
      ctx.disable()
    })
  }))

  it('keeps domain while using mongoose with find', Mocker.mockIt(function (mokr) {
    ctx.enable()
    const run = function (str) {
      return ctx.initContext(async _ => {
        ctx.set('id', str)
        await MangaModel.create({ name: 'test' + str })
        let o = ctx.get()
        assert.strictEqual(o.id, str)
        await MangaModel.find().skip(0).limit(1).exec()
        o = ctx.get()
        assert.strictEqual(o.id, str)
        o = ctx.get()
        assert.strictEqual(o.id, str)
      })
    }
    return Promise.all([
      run('a'),
      run('b')
    ]).finally(_ => {
      ctx.disable()
    })
  }))

  describe('canonicalize', () => {
    it('replaces spaces with _', () => {
      assert.strictEqual(MangaModel.canonicalize('a b c'), 'a_b_c')
    })

    it('is called upon validation', async () => {
      const manga = await MangaModel.create({ name: 'some name' })
      assert.strictEqual(manga.nameId, 'some_name')
    })

    it('should validationError if empty name', async () => {
      await assert.rejects(async () => MangaModel.create({ nameId: 'ok' }), { message: 'Manga validation failed: name: Path `name` is required.' })
    })
  })

  describe('findChapter', () => {
    it('returns null if no manga by _id', async () => {
      const res = await MangaModel.findChapter({ _id: '1'.repeat(24) })
      assert.strictEqual(res, null)
    })

    it('returns null if no manga by nameId', async () => {
      const res = await MangaModel.findChapter({ nameId: 'nomanga' })
      assert.strictEqual(res, null)
    })

    it('finds chapter by num and from', async () => {
      const mangaId = '0'.repeat(24)
      const chapterId = '1'.repeat(24)
      await Promise.all([
        ChapterModel.create({ _id: chapterId, mangaId, chapters: [{ num: 2, url: 'f' }], from: 'fanfox' }),
        MangaModel.create({ _id: mangaId, name: 'r' })
      ])
      const { _id } = await MangaModel.findChapter({ _id: mangaId, num: 2 }, 'fanfox')
      assert.strictEqual(_id.toString(), chapterId)
    })

    it('does not find if other from', async () => {
      const mangaId = '0'.repeat(24)
      const chapterId = '1'.repeat(24)
      await Promise.all([
        ChapterModel.create({ _id: chapterId, mangaId, chapters: [{ num: 2, url: 'f' }], from: 'fanfox' }),
        MangaModel.create({ _id: mangaId, name: 'r' })
      ])
      const res = await MangaModel.findChapter({ _id: mangaId, num: 2 }, 'manganelo')
      assert.strictEqual(res, null)
    })

    it('does not find if other num', async () => {
      const mangaId = '0'.repeat(24)
      const chapterId = '1'.repeat(24)
      await Promise.all([
        ChapterModel.create({ _id: chapterId, mangaId, chapters: [{ num: 2, url: 'f' }], from: 'fanfox' }),
        MangaModel.create({ _id: mangaId, name: 'r' })
      ])
      const res = await MangaModel.findChapter({ _id: mangaId, num: 4 }, 'fanfox')
      assert.strictEqual(res, null)
    })
  })

  describe('upsert', () => {
    it('upsert: create all', Mocker.mockIt(async function (mokr) {
      await MangaModel.upsertManga({
        name: 'test',
        chapters: [{ num: 2, url: 'b', at: 10 }, { num: 1, url: 'a', at: 5 }]
      }, 'mangakakalot')
      const x = await MangaModel.findOne({ name: 'test' })
      assert.strictEqual(x.lastChap_num, 2)
      assert.strictEqual(x.lastChap_at, 10)
      const { mangaId, from, chapters } = await ChapterModel.findOne({ mangaId: x._id })
      assert(mangaId.equals(x._id))
      assert.strictEqual(from, 'mangakakalot')
      assert.strictEqual(chapters.length, 2)
      assert.strictEqual(chapters[0].num, 2)
      assert.strictEqual(chapters[0].at, 10)
      assert.strictEqual(chapters[0].url, 'b')
      assert.strictEqual(chapters[1].num, 1)
      assert.strictEqual(chapters[1].at, 5)
      assert.strictEqual(chapters[1].url, 'a')
    }))

    it('upsert: reject if unknown from', Mocker.mockIt(async function (mokr) {
      let called = false
      try {
        await MangaModel.upsertManga({ nameId: 'test', name: 'test', chapters: [{ num: 1, url: 'a', at: 5 }] })
      } catch (e) {
        assert(e.errors.from.message.includes('Path `from` is required'))
        called = true
      }
      const got = await MangaModel.findOne()
      assert(!got, 'post cond: no manga touched on invalid from')
      assert(called)
    }))

    it('upsert: reject if no chapters', Mocker.mockIt(async function (mokr) {
      let called = false
      try {
        await MangaModel.upsertManga({ nameId: 'test', name: 'test', chapters: [] }, 'fanfox')
      } catch (e) {
        assert.strictEqual(e.id, errorHandler.noEmptyManga.id)
        called = true
      }
      const got = await MangaModel.findOne()
      assert(!got, 'post cond: no manga touched on invalid from')
      assert(called)
    }))

    it('fills description on creation', Mocker.mockIt(async function (mokr) {
      await MangaModel.upsertManga({
        name: 'test',
        chapters: [{ num: 2, url: 'b', at: 10 }],
        description: 'ok'
      }, 'mangakakalot')
      const x = await MangaModel.findOne({ name: 'test' })
      assert.strictEqual(x.description_content, 'ok')
      assert.strictEqual(x.description_from, 'mangakakalot')
    }))

    it('fills description if not existing', Mocker.mockIt(async function (mokr) {
      await MangaModel.create({ name: 'test' })
      await MangaModel.upsertManga({
        name: 'test',
        chapters: [{ num: 2, url: 'b', at: 10 }],
        description: 'ok'
      }, 'mangakakalot')
      const x = await MangaModel.findOne({ name: 'test' })
      assert.strictEqual(x.description_content, 'ok')
      assert.strictEqual(x.description_from, 'mangakakalot')
    }))

    it('does not touch if description exists', Mocker.mockIt(async function (mokr) {
      await MangaModel.create({ name: 'test', description_content: 'untouched' })
      await MangaModel.upsertManga({
        name: 'test',
        chapters: [{ num: 2, url: 'b', at: 10 }],
        description: 'ok'
      }, 'mangakakalot')
      const x = await MangaModel.findOne({ name: 'test' })
      assert.strictEqual(x.description_content, 'untouched')
    }))

    it('upserts description even if no chap update', Mocker.mockIt(async function (mokr) {
      await MangaModel.create({ name: 'test', description_content: 'untouched', lastChap_num: 10 })
      await MangaModel.upsertManga({
        name: 'test',
        chapters: [{ num: 8, url: 'b', at: 10 }],
        description: 'ok'
      }, 'mangakakalot')
      const x = await MangaModel.findOne({ name: 'test' })
      assert.strictEqual(x.description_content, 'untouched')
      assert.strictEqual(x.lastChap_num, 10)
    }))

    it('overrides description and url', Mocker.mockIt(async function (mokr) {
      await MangaModel.create({ name: 'test', thumbUrl: 'b', description_content: 'a' })
      await MangaModel.upsertManga({
        name: 'test',
        chapters: [{ num: 2, url: 'b', at: 10 }],
        description: 'ok',
        thumbUrl: 'a'
      }, 'mangakakalot', { refreshThumbUrl: true, refreshDescription: true })
      const x = await MangaModel.findOne({ name: 'test' })
      assert.strictEqual(x.description_content, 'ok')
      assert.strictEqual(x.description_from, 'mangakakalot')
      assert.strictEqual(x.thumbUrl, 'b')
    }))

    it('sets author', Mocker.mockIt(async function (mokr) {
      await MangaModel.create({ name: 'test', author: 'a' })
      await MangaModel.upsertManga({
        name: 'test',
        chapters: [{ num: 2, url: 'b', at: 10 }],
        author: 'roger'
      }, 'mangakakalot')
      const x = await MangaModel.findOne({ name: 'test' })
      assert.strictEqual(x.author, 'roger')
    }))

    it('let author untouched if not given', Mocker.mockIt(async function (mokr) {
      await MangaModel.create({ name: 'test', author: 'a' })
      await MangaModel.upsertManga({
        name: 'test',
        chapters: [{ num: 2, url: 'b', at: 10 }]
      }, 'mangakakalot')
      const x = await MangaModel.findOne({ name: 'test' })
      assert.strictEqual(x.author, 'a')
    }))
  })
  describe('getTaggableText', () => {
    it('returns contatenation of author, name, description_content', () => {
      const m = new MangaModel({ author: 'Seongdae', name: 'abc', description_content: 'def' })
      assert.strictEqual(m.getTaggableText(), 'Seongdae abc def')
    })
  })
})
