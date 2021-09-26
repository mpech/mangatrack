const assert = require('assert')
const Mocker = require('../../lib/mocker')
const batch = require('../../process/batchProcess')
const errorHandler = require('../../lib/errorHandler')
const LinkActivity = require('../../activity/linkActivity')
const ChapterModel = require('../../models/chapterModel')
const MangaModel = require('../../models/mangaModel')
const utils = require('../utils/')
utils.bindDb()

describe('process/batchProcess', function () {
  beforeEach(utils.clearColls([MangaModel, ChapterModel]))
  describe('runLink', () => {
    it('throws if no found importers', async () => {
      await assert.rejects(() => batch.runLink('http://nope'), { id: errorHandler.noImporterFound.id })
    })

    it('runs link from valid link', Mocker.mockIt(async mokr => {
      let called = false
      let batchEvent = false
      mokr.mock(LinkActivity.prototype, 'importLink', () => {
        called = true
        return {
          on: (str, cbk) => {
            batchEvent = str
            cbk()
          }
        }
      })
      await batch.runLink('https://mangakakalot.com/manga/qi925902')
      assert(called)
      assert.strictEqual(batchEvent, 'batchended')
    }))

    it('runs link from valid chap link', Mocker.mockIt(async mokr => {
      let called = false
      let batchEvent = false
      mokr.mock(LinkActivity.prototype, 'importLink', () => {
        called = true
        return {
          on: (str, cbk) => {
            batchEvent = str
            cbk()
          }
        }
      })
      await batch.runLink('https://mangakakalot.com/chapter/qi925902/chapter_5')
      assert(called)
      assert.strictEqual(batchEvent, 'batchended')
    }))
  })

  describe('runId', () => {
    it('runs import from mangaId', Mocker.mockIt(async mokr => {
      const mangaId = '0'.repeat(24)
      const chapterId = '1'.repeat(24)
      const chapterUrl = 'https://fanfox.net/manga/the_golden_age_park_hui_jin/c033/1.html#ipg1'
      await Promise.all([
        ChapterModel.create({ _id: chapterId, mangaId, chapters: [{ num: 2, url: chapterUrl }], from: 'fanfox' }),
        MangaModel.create({ _id: mangaId, name: 'r' })
      ])
      let calledUrl = ''
      mokr.mock(batch, 'runLink', async url => {
        calledUrl = url
      })
      await batch.runId(mangaId)
      assert.strictEqual(calledUrl, chapterUrl)
    }))

    it('ignores mangakakalot for refresh', Mocker.mockIt(async mokr => {
      const mangaId = '0'.repeat(24)
      const chapterId = '1'.repeat(24)
      const chapterUrl = 'https://fanfox.net/manga/the_golden_age_park_hui_jin/c033/1.html#ipg1'
      await Promise.all([
        ChapterModel.create({ _id: chapterId, mangaId, chapters: [{ num: 2, url: chapterUrl }], from: 'mangakakalot' }),
        MangaModel.create({ _id: mangaId, name: 'r' })
      ])
      await assert.rejects(() => batch.runId(mangaId), { id: errorHandler.notFound.id })
    }))
  })
})
