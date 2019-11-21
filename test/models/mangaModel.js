var assert = require('assert')
var utils = require('../utils/')
var MangaModel = require('../../models/mangaModel')
var Mocker = require('../../lib/mocker')
var ctx = require('../../lib/ctx')

utils.bindDb()
describe('models mangaModel', function () {
  beforeEach(utils.clearColls([MangaModel]))

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

  it('upsert', Mocker.mockIt(async function (mokr) {
    await MangaModel.upsertManga({ name: 'test', chapters: [{ num: 1, url: 'a', at: 5 }, { num: 2, url: 'a', at: 10 }] })
    const x = await MangaModel.findOne({ name: 'test' })
    assert.strictEqual(x.chapters.length, 2)
    assert.strictEqual(x.chapters[0].num, 2)
    assert.strictEqual(x.chapters[0].at, 10)
    assert.strictEqual(x.updatedAt, 10)
  }))

  it('upsert existing updatedAt', Mocker.mockIt(async function (mokr) {
    await MangaModel.create({ name: 'test', chapters: [{ num: 1, url: 'a' }] })
    await MangaModel.upsertManga({ nameId: 'test', name: 'test', chapters: [{ num: 1, url: 'a', at: 5 }, { num: 2, url: 'a', at: 10 }] })
    const x = await MangaModel.findOne()
    assert.strictEqual(x.chapters.length, 2)
    assert.strictEqual(x.chapters[0].num, 2)
    assert.strictEqual(x.chapters[0].at, 10)
    assert.strictEqual(x.updatedAt, 10)
  }))
})
