var assert = require('assert')
var path = require('path')
var utils = require('../utils/')
var Mocker = require('../../lib/mocker')
var fs = require('fs')
var util = require('util')
var pread = util.promisify(fs.readFile)
var Importer = require('../../importers/manganelo')
var cheerio = require('cheerio')
utils.bindDb()
describe('importers/manganelo', function () {
  it('allUpdates', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/manganelo/main.html'))
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
    assert.strictEqual(Object.keys(res)[0], 'Love Joto!')
    const v = res['Love Joto!']
    assert.strictEqual(v.num, 2)
    assert.strictEqual(v.last, 5)
    assert.strictEqual(v.url, 'https://manganelo.com/chapter/pw919389/chapter_2')
    assert.strictEqual(v.thumbUrl, 'https://avt.mkklcdnv3.com/avatar_225_new/796-pw919389.jpg')
  }))

  it('fetchMangaDetail half chapter', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/manganelo/half.html'))
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
    assert.strictEqual(chapters.length, 12)
    assert.deepStrictEqual(chapters.map(c => c.num), [1, 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 5.3].reverse())
    const c = chapters[0]
    assert.strictEqual(c.name, "The World's Best Assassin, Reincarnated in a Different World as an Aristocrat chapter Chapter 5.3")
    assert.strictEqual(c.num, 5.3)
    assert.strictEqual(c.url, 'https://manganelo.com/chapter/qg918612/chapter_5.3')
    const date = new Date(c.at)
    assert.strictEqual(date.getFullYear(), 2020)
    assert.strictEqual(date.getMonth(), 0)
    assert.strictEqual(date.getDate(), 8)
  }))

  it('get linkFromChap', function () {
    const imp = new Importer()
    const link = imp.linkFromChap({ url: 'https://manganelo.com/chapter/qg918612/chapter_5.3' })
    assert.strictEqual(link, 'https://manganelo.com/manga/qg918612')
  })

  it('fills manga', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/manganelo/detail.html'))
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
    assert.strictEqual(manga.name, 'Otome Danshi Ni Koisuru Otome')
    assert.strictEqual(manga.thumbUrl, 'https://avt.mkklcdnv3.com/avatar_225/19220-otome_danshi_ni_koisuru_otome.jpg')
    const desc = manga.description.substring(0, 30)
    assert.strictEqual(desc, 'A 30 episodes short comic by S')
  }))

  it('accepts links', Mocker.mockIt(async mokr => {
    const imp = new Importer()
    assert(imp.isLinkValid('https://manganelo.com/manga/isekai_tensei_ni_kansha_o'))
    assert(imp.isLinkValid('https://manganelo.com/manga/isekai_tensei_ni_kansha_o/'))
    assert(!imp.isLinkValid('https://manganelo.com/manga/isekai_tensei_ni_kansha_o/f/'))
    assert(imp.isLinkValid('https://manganelo.com/manga/isekai_tensei_ni_kansha_o'))
  }))

  it('accepts chap url', Mocker.mockIt(async mokr => {
    const imp = new Importer()
    assert(imp.accepts('https://manganelo.com/chapter/qg918612/chapter_5.3'))
  }))
})
