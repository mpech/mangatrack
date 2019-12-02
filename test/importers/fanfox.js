var assert = require('assert')
var path = require('path')
var utils = require('../utils/')
var Mocker = require('../../lib/mocker')
var fs = require('fs')
var util = require('util')
var pread = util.promisify(fs.readFile)
var Importer = require('../../importers/fanfox')
var cheerio = require('cheerio')
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
    assert.strictEqual(v.url, '/manga/spirit_blade_mountain/c415/1.html')
    assert.strictEqual(v.thumbUrl, 'http://fmcdn.fanfox.net/store/manga/18289/cover.jpg')
  }))

  it('fetchMangaDetail', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async url => {
      assert.strictEqual(url, 'http://fanfox.net/manga/onepunch_man/')
      called = true
      const s = await pread(path.resolve(__dirname, '../../samples/fanfox/detail.html'))
      return cheerio.load(s.toString(), {
        xml: {
          normalizeWhitespace: true,
          decodeEntities: false
        }
      })
    })
    mokr.mock(Importer.prototype, 'parseDate', _ => 5)
    const res = await importer.fetchMangaDetail({ url: 'http://fanfox.net/manga/onepunch_man/vTBD/c122/1.html' })
    assert(called)
    assert.strictEqual(res.length, 197)
    const dic = res.reduce((acc, x) => {
      acc[Math.floor(x.num)] = 1
      return acc
    }, {})
    for (let i = 1; i <= 122; ++i) {
      assert(dic[i], ' has ' + i)
    }
    const c = res[11]
    assert.strictEqual(c.name, 'Bonus: Owned Items')
    assert.strictEqual(c.num, 111.5)
    const date = new Date(c.at)
    // is enough to check the date has been parsed
    assert.strictEqual(date.getFullYear(), 2019)
    assert.strictEqual(date.getMonth(), 6)
    assert.strictEqual(date.getDate(), 29)
    assert.strictEqual(c.url, '/manga/onepunch_man/vTBD/c111.5/1.html')
  }))
})
