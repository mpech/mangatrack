const assert = require('assert')
const utils = require('../utils/')
const MangaModel = require('../../models/mangaModel')
const ChapterModel = require('../../models/chapterModel')
const Mocker = require('../../lib/mocker')
const ctx = require('../../lib/ctx')

utils.bindDb()
describe('models/mangaModel', function () {
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

  it('canonicalize', Mocker.mockIt(function (mokr) {
    assert.strictEqual(MangaModel.canonicalize('a b c'), 'a_b_c')
  }))

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
})
