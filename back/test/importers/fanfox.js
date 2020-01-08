const assert = require('assert')
const path = require('path')
const cheerio = require('cheerio')
const fs = require('fs')
const util = require('util')
const utils = require('../utils/')
const Mocker = require('../../lib/mocker')
const pread = util.promisify(fs.readFile)
const Importer = require('../../importers/fanfox')
const errorHandler = require('../../lib/errorHandler')

utils.bindDb()
describe('importers/fanfox', function () {
  it('allUpdates', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/fanfox/main.html'))
      return cheerio.load(s.toString(), {
        xml: {
          normalizeWhitespace: true,
          decodeEntities: false
        }
      })
    })
    let firstCall = 0
    mokr.mock(Importer.prototype, 'parseDate', last => {
      if (firstCall++ < 1) {
        assert.strictEqual(last, '16 minute ago')
      }
      return 5
    })
    const res = await importer.allUpdates()
    assert(called)
    assert.strictEqual(Object.keys(res).length, 21)
    assert.strictEqual(Object.keys(res)[0], 'Spirit Blade Mountain')
    const v = res['Spirit Blade Mountain']
    assert.strictEqual(v.num, 415)
    assert.strictEqual(v.last, 5)
    assert.strictEqual(v.url, 'https://fanfox.net/manga/spirit_blade_mountain/c415/1.html')
    assert.strictEqual(v.thumbUrl, 'http://fmcdn.fanfox.net/store/manga/18289/cover.jpg')
  }))

  it('fetchMangaDetail', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async url => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/fanfox/detail.html'))
      return cheerio.load(s.toString(), {
        xml: {
          normalizeWhitespace: true,
          decodeEntities: false
        }
      })
    })
    const { chapters, manga } = await importer.fetchMangaDetail('https://fanfox.net/manga/wan_gu_shen_wang/', { ok: true })
    assert(called)
    assert(manga.ok)
    assert.strictEqual(chapters.length, 197)
    const dic = chapters.reduce((acc, x) => {
      acc[Math.floor(x.num)] = 1
      return acc
    }, {})
    for (let i = 1; i <= 122; ++i) {
      assert(dic[i], ' has ' + i)
    }
    const c = chapters[11]
    assert.strictEqual(c.name, 'Bonus: Owned Items')
    assert.strictEqual(c.num, 111.5)
    const date = new Date(c.at)
    // is enough to check the date has been parsed
    assert.strictEqual(date.getFullYear(), 2019)
    assert.strictEqual(date.getMonth(), 6)
    assert.strictEqual(date.getDate(), 29)
    assert.strictEqual(c.url, 'https://fanfox.net/manga/onepunch_man/vTBD/c111.5/1.html')
  }))

  it('fetchMangaDetail: parses date "yesterday"', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async url => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/fanfox/wan_gu_shen_wang.html'))
      return cheerio.load(s.toString(), {
        xml: {
          normalizeWhitespace: true,
          decodeEntities: false
        }
      })
    })
    let i = 0
    mokr.mock(Importer.prototype, 'parseDate', s => {
      if (i++ === 1) {
        assert.strictEqual(s, 'Yesterday')
      }
      return 5
    })
    const { chapters: [, c] } = await importer.fetchMangaDetail('https://fanfox.net/manga/wan_gu_shen_wang/')
    assert.strictEqual(c.at, 5)
    assert(called)
  }))

  it('fetchMangaDetail: fails if requires browser interaction', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async url => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/fanfox/tadokoro_san_tatsubon.html'))
      return cheerio.load(s.toString(), {
        xml: {
          normalizeWhitespace: true,
          decodeEntities: false
        }
      })
    })
    let thrown = false
    try {
      await importer.fetchMangaDetail()
    } catch (e) {
      assert.strictEqual(e.id, errorHandler.importerRequiresInteraction.id)
      thrown = true
    }
    assert(called)
    assert(thrown)
  }))

  it('get linkFromChap', function () {
    const imp = new Importer()
    const link = imp.linkFromChap({ url: 'https://fanfox.net/manga/onepunch_man/vTBD/c122/1.html' })
    assert.strictEqual(link, 'https://fanfox.net/manga/onepunch_man/')
  })

  it('fills manga', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/fanfox/wan_gu_shen_wang.html'))
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
    assert.strictEqual(manga.name, 'Wan Gu Shen Wang')
    assert.strictEqual(manga.thumbUrl, 'https://fmcdn.fanfox.net/store/manga/32000/cover.jpg?token=8db4bd8e56fd7952d8bcbabac9a6ac30317dc4c3&ttl=1575532800&v=1575441701')
    assert(manga.description.startsWith('The past life died beca'))
    assert(manga.description.endsWith('t...'))
  }))

  it('accepts links', Mocker.mockIt(async mokr => {
    const imp = new Importer()
    assert(imp.isLinkValid('https://fanfox.net/manga/onepunch_man/'))
    assert(imp.isLinkValid('https://fanfox.net/manga/onepunch_man'))
    assert(!imp.isLinkValid('https://fanfox.net/manga/onepunch_man/f'))
  }))

  it('accepts chap url', Mocker.mockIt(async mokr => {
    const imp = new Importer()
    assert(imp.accepts('https://fanfox.net/manga/onepunch_man/vTBD/c122/1.html'))
  }))
})
