import assert from 'assert'
import cheerio from 'cheerio'
import utils from '../utils/index.js'
import Mocker from '../../lib/mocker.js'
import Importer from '../../importers/mangakakalot.js'
import errorHandler from '../../lib/errorHandler.js'
import axios from 'axios'

utils.bindDb()
describe('importers/mangakakalot', function () {
  describe('allUpdates', () => {
    it('allUpdates 1', Mocker.mockIt(async mokr => {
      const importer = new Importer()
      let called = false
      mokr.mock(Importer.prototype, 'domFetch', async _ => {
        called = true
        return utils.loadDom('mangakakalot/main.html')
      })
      mokr.mock(Importer.prototype, 'parseDate', _ => 5)
      const res = await importer.allUpdates()
      assert(called)
      assert.strictEqual(Object.keys(res).length, 56)
      assert.strictEqual(Object.keys(res)[0], 'Dokuzakura')
      const v = res.Dokuzakura
      assert.strictEqual(v.num, 33)
      assert.strictEqual(v.last, 5)
      assert.strictEqual(v.url, 'https://mangakakalot.com/chapter/ql920170/chapter_33')
      assert.strictEqual(v.thumbUrl, 'https://avt.mkklcdnv6temp.com/9/b/19-1583499431.jpg')
    }))

    it('allUpdates 2', Mocker.mockIt(async mokr => {
      const importer = new Importer()
      let called = false
      mokr.mock(Importer.prototype, 'domFetch', async _ => {
        called = true
        return utils.loadDom('mangakakalot/allUpdates_small.html')
      })
      mokr.mock(Importer.prototype, 'parseDate', _ => 5)
      const res = await importer.allUpdates()
      assert(called)
      const v = Object.values(res)
      assert.strictEqual(v.length, 1)
      const o = v[0]
      assert.strictEqual(o.num, 18)
    }))
  })

  describe('fetchMangaDetail', () => {
    it('fetchMangaDetail half chapter', Mocker.mockIt(async mokr => {
      const importer = new Importer()
      let called = false
      mokr.mock(Importer.prototype, 'domFetch', async _ => {
        called = true
        return utils.loadDom('mangakakalot/detail.html')
      })
      const { chapters, manga } = await importer.fetchMangaDetail(null, { keptChapt: true })
      assert(called)
      assert(manga.keptChapt)
      assert.strictEqual(manga.author, 'Ooima Yoshitoki')
      assert.strictEqual(manga.aliasName, 'Alternative : 不滅のあなたへ (Japanese); 致不灭的你 (Chinese); Fumetsu no Anata e; To Your Eternity (English)')
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

    it('throws on infinit loop', Mocker.mockIt(async mokr => {
      const importer = new Importer()
      mokr.mock(Importer.prototype, 'accepts', () => true)
      mokr.mock(Importer.prototype, 'domFetch', async link => {
        return cheerio.load('<html><script>window.location.assign("first")</script></html>')
      })
      assert.rejects(
        () => importer.fetchMangaDetail('first'),
        { id: errorHandler.tooManyRedirect.id }
      )
    }))

    it('fetchMangaDetail special chars in title', Mocker.mockIt(async mokr => {
      const importer = new Importer()
      mokr.mock(Importer.prototype, 'domFetch', async _ => {
        return utils.loadDom('mangakakalot/ticplus.html')
      })
      const { manga: { description } } = await importer.fetchMangaDetail(null, { keptChapt: true })
      assert(description.startsWith('Gag driven, short episodes'))
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

    it('fills manga', Mocker.mockIt(async mokr => {
      const importer = new Importer()
      let called = false
      mokr.mock(Importer.prototype, 'domFetch', async _ => {
        called = true
        return utils.loadDom('mangakakalot/detail.html')
      })
      const { manga } = await importer.fetchMangaDetail()
      assert(called)
      assert(manga)
      assert.strictEqual(manga.name, 'To You, The Immortal')
      assert.strictEqual(manga.thumbUrl, 'https://avt.mkklcdnv3.com/avatar_225/17829-to_you_the_immortal.jpg')
      assert(manga.description.startsWith('An immortal being was sent'))
    }))

    it('handles redirect', Mocker.mockIt(async mokr => {
      const importer = new Importer()
      let called = false

      mokr.mock(Importer.prototype, 'accepts', () => true)
      mokr.mock(Importer.prototype, 'domFetch', async link => {
        if (link === 'first') {
          return utils.loadDom('mangakakalot/redirect.html')
        }
        assert.strictEqual(link, 'https://mangakakalot.com/read-iz9jc158504822298')
        called = true
        return utils.loadDom('mangakakalot/martial_peak.html')
      })
      const { manga, chapters } = await importer.fetchMangaDetail('first')
      assert(called)
      assert(manga)
      assert.strictEqual(manga.name, 'Martial Peak')
      assert.strictEqual(manga.thumbUrl, 'https://avt.mkklcdnv6.com/20/b/16-1583494192.jpg')
      assert(manga.description.startsWith('The journey to the marti'), manga.description)
      assert.strictEqual(chapters.length, 547)
    }))

    it('handles more redirect', Mocker.mockIt(async mokr => {
      const importer = new Importer()
      mokr.mock(Importer.prototype, 'accepts', () => true)
      let redirected = ''
      mokr.mock(axios, 'get', async (url) => {
        if (url === 'first') {
          return { data: '<html><script>window.location.assign("https://mangakakalot.com/read-tu9im158524536237");</script></html>' }
        }
        redirected = 'https://mangakakalot.com/read-tu9im158524536237'
        return { data: '<html></html>' }
      })
      await importer.fetchMangaDetail('first')
      assert.strictEqual(redirected, 'https://mangakakalot.com/read-tu9im158524536237')
    }))
  })

  describe('linkFromChap', () => {
    it('get linkFromChap', () => {
      const imp = new Importer()
      const link = imp.linkFromChap({ url: 'https://mangakakalot.com/chapter/to_you_the_immortal/chapter_110' })
      assert.strictEqual(link, 'https://mangakakalot.com/manga/to_you_the_immortal')
    })
  })

  describe('isLinkValid', () => {
    it('accepts links', () => {
      const imp = new Importer()
      assert(imp.isLinkValid('https://mangakakalot.com/manga/isekai_tensei_ni_kansha_o'))
      assert(imp.isLinkValid('https://mangakakalot.com/manga/isekai_tensei_ni_kansha_o/'))
      assert(!imp.isLinkValid('https://mangakakalot.com/manga/isekai_tensei_ni_kansha_o/f/'))
      assert(!imp.isLinkValid('https://manganelo.com/manga/isekai_tensei_ni_kansha_o'))
    })
  })

  describe('accepts', () => {
    it('accepts chap url', () => {
      const imp = new Importer()
      assert(imp.accepts('https://mangakakalot.com/chapter/to_you_the_immortal/chapter_110'))
    })
  })
})
