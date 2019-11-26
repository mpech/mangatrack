var assert = require('assert')
var path = require('path')
var utils = require('../utils/')
var Mocker = require('../../lib/mocker')
var fs = require('fs')
var util = require('util')
var pread = util.promisify(fs.readFile)
var Importer = require('../../importers/mangakakalot')
var cheerio = require('cheerio')
utils.bindDb()
describe('importers/mangakakalot', function () {
  it('allUpdates', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/mangakakalot/main.html'))
      return cheerio.load(s.toString(), {
        xml: {
          normalizeWhitespace: true,
          decodeEntities: false
        }
      })
    })
    mokr.mock(Importer.prototype, 'parseDate', _ => 5)
    const res = await importer.allUpdates()
    assert(called)
    assert.strictEqual(Object.keys(res).length, 56)
    assert.strictEqual(Object.keys(res)[0], "Girl's World")
    const v = res["Girl's World"]
    assert.strictEqual(v.num, 179)
    assert.strictEqual(v.last, 5)
    assert.strictEqual(v.url, 'https://manganelo.com/chapter/girls_world/chapter_179')
    assert.strictEqual(v.thumbUrl, 'https://avt.mkklcdnv3.com/avatar_225/18936-girls_world.jpg')
  }))

  it('allUpdates', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/mangakakalot/allUpdates_small.html'))
      return cheerio.load(s.toString(), {
        xml: {
          normalizeWhitespace: true,
          decodeEntities: false
        }
      })
    })
    mokr.mock(Importer.prototype, 'parseDate', _ => 5)
    const res = await importer.allUpdates()
    assert(called)
    const v = Object.values(res)
    assert.strictEqual(v.length, 1)
    const o = v[0]
    assert.strictEqual(o.num, 18)
  }))

  it('parseDate min ago', Mocker.mockIt(mokr => {
    const importer = new Importer()
    const ref = new Date(2019, 10, 13, 10)
    let d = new Date(importer.parseDate('42 mins ago', ref.getTime()))
    assert(d.toString().includes('Nov 13 2019 09:18:00'))
    d = new Date(importer.parseDate('2 hour ago', ref.getTime()))
    assert(d.toString().includes('Nov 13 2019 08:00:00'))
    d = new Date(importer.parseDate('11-05 16:04', ref.getTime()))
    assert(d.toString().includes('Nov 05 2019 16:04:00'))
  }))

  it('fetchMangaDetail', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/mangakakalot/detail.html'))
      return cheerio.load(s.toString(), {
        xml: {
          normalizeWhitespace: true,
          decodeEntities: false
        }
      })
    })
    mokr.mock(Importer.prototype, 'parseDate', _ => 5)
    const res = await importer.fetchMangaDetail({ url: 'https://mangakakalot.com/manga/to_you_the_immortal/chapter_110' })
    assert(called)
    assert.strictEqual(res.length, 117)
    const dic = res.reduce((acc, x) => {
      acc[x.num] = 1
      return acc
    }, {})
    for (let i = 1; i <= 113; ++i) {
      assert(dic[i], ' has ' + i)
    }
    const c = res[1]
    assert.strictEqual(c.name, 'To You, The Immortal Chapter 112.5: Then, Towards the Sunrise (2)')
    assert.strictEqual(c.num, 112.5)
    const date = new Date(c.at)
    // is enough to check the date has been parsed
    assert.strictEqual(date.getFullYear(), 2019)
    assert.strictEqual(date.getMonth(), 9)
    assert.strictEqual(date.getDate(), 19)
    assert.strictEqual(c.url, 'https://mangakakalot.com/chapter/to_you_the_immortal/chapter_112.5')
  }))

  it('fetchMangaDetail', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', url => {
      assert.strictEqual(url, 'https://mangakakalot.com/manga/to_you_the_immortal')
      called = true
      return Promise.resolve(cheerio.load(''))
    })
    await importer.fetchMangaDetail({ url: 'https://mangakakalot.com/chapter/to_you_the_immortal/chapter_110' })
    assert(called)
  }))

  it('parseDateDetail', Mocker.mockIt(mokr => {
    const importer = new Importer()
    const ts = importer.parseDateDetail('1 day ago', 1576436400000)
    const date = new Date(ts)
    assert.strictEqual(date.getDate(), 14)
  }))
})
