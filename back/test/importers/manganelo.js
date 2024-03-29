import assert from 'assert'
import utils from '../utils/index.js'
import Mocker from '../../lib/mocker.js'
import Importer from '../../importers/manganelo.js'

utils.bindDb()
describe('importers/manganelo', function () {
  it('allUpdates', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      return utils.loadDom('manganelo/main.html')
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
      return utils.loadDom('manganelo/half.html')
    })
    const { chapters, manga } = await importer.fetchMangaDetail(null, { keptChapt: true })
    assert(called)
    assert(manga.keptChapt)
    assert.deepStrictEqual(manga.authors, ['Rui Tsukiyo'])
    assert.strictEqual(manga.aliasName, 'Sekai Saikyou no Assassin, isekai kizoku ni tensei suru, Sekai saikō no asashin, isekai kizoku ni tensei suru, The Best Assassin, Incarnated into a Different World’s Aristocrat, The World’s Best Assassin, Reincarnated in a Different World as an Aristocrat, 世界最高の暗殺者、異世界貴族に転生する')
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

  it('concatenate authors propertly', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      return utils.loadDom('manganelo/crimsonKarma.html')
    })
    const { manga } = await importer.fetchMangaDetail(null, { keptChapt: true })
    assert(called)
    assert.deepStrictEqual(manga.authors, ['Lemonfrog', 'Emongeguri'])
    assert.strictEqual(manga.aliasName, '진홍의 카르마')
  }))

  it('fetchMangaDetail failing chap', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      return utils.loadDom('manganelo/rn918211')
    })
    const { chapters: [c] } = await importer.fetchMangaDetail(null, { keptChapt: true })
    assert(called)
    assert.strictEqual(c.name, 'Leviathan (Lee Gyuntak) chapter Chapter 172')
    assert.strictEqual(c.num, 172)
    assert.strictEqual(c.url, 'https://readmanganato.com/manga-dx980680/chapter-172')
  }))

  describe('linkFromChap', () => {
    it('get linkFromChap', function () {
      const imp = new Importer()
      const link = imp.linkFromChap({ url: 'https://manganelo.com/chapter/qg918612/chapter_5.3' })
      assert.strictEqual(link, 'https://manganelo.com/manga/qg918612')
    })
    it('get linkFromChap from manganato', function () {
      const imp = new Importer()
      const link = imp.linkFromChap({ url: 'https://readmanganato.com/manga-ht984802/chapter-106' })
      assert.strictEqual(link, 'https://readmanganato.com/manga-ht984802')
    })
  })

  it('fills manga', Mocker.mockIt(async mokr => {
    const importer = new Importer()
    let called = false
    mokr.mock(Importer.prototype, 'domFetch', async _ => {
      called = true
      return utils.loadDom('manganelo/detail.html')
    })
    const { manga } = await importer.fetchMangaDetail()
    assert(called)
    assert(manga)
    assert.strictEqual(manga.name, 'Otome Danshi Ni Koisuru Otome')
    assert.strictEqual(manga.thumbUrl, 'https://avt.mkklcdnv3.com/avatar_225/19220-otome_danshi_ni_koisuru_otome.jpg')
    const desc = manga.description.substring(0, 30)
    assert.strictEqual(desc, 'A 30 episodes short comic by S')
  }))

  describe('isLinkValid', () => {
    it('accepts links', Mocker.mockIt(async mokr => {
      const imp = new Importer()
      assert(imp.isLinkValid('https://manganelo.com/manga/isekai_tensei_ni_kansha_o'))
      assert(imp.isLinkValid('https://manganelo.com/manga/isekai_tensei_ni_kansha_o/'))
      assert(!imp.isLinkValid('https://manganelo.com/manga/isekai_tensei_ni_kansha_o/f/'))
      assert(imp.isLinkValid('https://manganelo.com/manga/isekai_tensei_ni_kansha_o'))
    }))

    it('validates links readmanganato', () => {
      const imp = new Importer()
      assert(imp.isLinkValid('https://readmanganato.com/manga-ht984802'))
    })
  })
  describe('accepts', () => {
    it('accepts chap url', Mocker.mockIt(async mokr => {
      const imp = new Importer()
      assert(imp.accepts('https://manganelo.com/chapter/qg918612/chapter_5.3'))
      assert(imp.accepts('https://manganelo.com/chapter/qg918612/chapter_5.3'))
    }))
    it('accepts links from readmanganato', () => {
      const imp = new Importer()
      assert(imp.accepts('https://readmanganato.com/manga-ht984802'))
    })
  })
})
