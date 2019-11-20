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
      return ctx.initContext(_ => {
        ctx.set('id', str)
        return MangaModel.create({ name: 'test' + str }).then(p => {
          const o = ctx.get()
          assert.strictEqual(o.id, str)
          return MangaModel.find().skip(0).limit(1).exec().then(q => {
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

  it('canonicalize', Mocker.mockIt(function (mokr) {
    assert.strictEqual(MangaModel.canonicalize('a b c'), 'a_b_c')
  }))

  it('upsert', Mocker.mockIt(function (mokr) {
    return MangaModel.upsertManga({ name: 'test', chapters: [{ num: 1, url: 'a', at: 5 }, { num: 2, url: 'a', at: 10 }] }).then(_ => {
      return MangaModel.findOne({ name: 'test' }).then(x => {
        assert.strictEqual(x.chapters.length, 2)
        assert.strictEqual(x.chapters[0].num, 2)
        assert.strictEqual(x.chapters[0].at, 10)
        assert.strictEqual(x.updatedAt, 10)
      })
    })
  }))

  it('upsert existing updatedAt', Mocker.mockIt(function (mokr) {
    return MangaModel.create({ name: 'test', chapters: [{ num: 1, url: 'a' }] }).then(x => {
      return MangaModel.upsertManga({ nameId: 'test', name: 'test', chapters: [{ num: 1, url: 'a', at: 5 }, { num: 2, url: 'a', at: 10 }] })
    }).then(_ => {
      return MangaModel.findOne().then(x => {
        assert.strictEqual(x.chapters.length, 2)
        assert.strictEqual(x.chapters[0].num, 2)
        assert.strictEqual(x.chapters[0].at, 10)
        assert.strictEqual(x.updatedAt, 10)
      })
    })
  }))
})
