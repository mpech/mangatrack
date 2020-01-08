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

  it('fetchMangaDetail half chapter', Mocker.mockIt(async mokr => {
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
    const { chapters, manga } = await importer.fetchMangaDetail(null, { keptChapt: true })
    assert(called)
    assert(manga.keptChapt)
    assert.strictEqual(chapters.length, 117)
    const dic = chapters.reduce((acc, x) => {
      acc[x.num] = 1
      return acc
    }, {})
    for (let i = 1; i <= 113; ++i) {
      assert(dic[i], ' has ' + i)
    }
    const c = chapters[1]
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
    await importer.fetchMangaDetail('https://mangakakalot.com/manga/to_you_the_immortal')
    assert(called)
  }))

  it('get linkFromChap', function () {
    const imp = new Importer()
    const link = imp.linkFromChap({ url: 'https://mangakakalot.com/chapter/to_you_the_immortal/chapter_110' })
    assert.strictEqual(link, 'https://mangakakalot.com/manga/to_you_the_immortal')
  })

  it('fills manga', Mocker.mockIt(async mokr => {
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
    const { manga } = await importer.fetchMangaDetail()
    assert(called)
    assert(manga)
    assert.strictEqual(manga.name, 'To You, The Immortal')
    assert.strictEqual(manga.thumbUrl, 'https://avt.mkklcdnv3.com/avatar_225/17829-to_you_the_immortal.jpg')
    assert(manga.description.startsWith('An immortal being was sent'))
  }))

  it('accepts links', Mocker.mockIt(async mokr => {
    const imp = new Importer()
    assert(imp.isLinkValid('https://mangakakalot.com/manga/isekai_tensei_ni_kansha_o'))
    assert(imp.isLinkValid('https://mangakakalot.com/manga/isekai_tensei_ni_kansha_o/'))
    assert(!imp.isLinkValid('https://mangakakalot.com/manga/isekai_tensei_ni_kansha_o/f/'))
    assert(!imp.isLinkValid('https://manganelo.com/manga/isekai_tensei_ni_kansha_o'))
  }))

  it('accepts chap url', Mocker.mockIt(async mokr => {
    const imp = new Importer()
    assert(imp.accepts('https://mangakakalot.com/chapter/to_you_the_immortal/chapter_110'))
  }))
})
