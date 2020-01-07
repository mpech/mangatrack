const assert = require('assert')
const utils = require('../utils/')
const Mocker = require('../../lib/mocker')
const Activity = require('../../activity/importerActivity')
const MangaModel = require('../../models/mangaModel')
const ChapterModel = require('../../models/chapterModel')
const BatchModel = require('../../models/batchModel')
const errorHandler = require('../../lib/errorHandler')

utils.bindDb()
describe('activity/importerActivity', function () {
  beforeEach(utils.clearColls([MangaModel, ChapterModel, BatchModel]))
  it('refreshes with existing manga: nothing happens', Mocker.mockIt(async mokr => {
    let fetchedDetail = false
    const importer = {
      allUpdates: _ => Promise.resolve({
        'Release That Witch': {
          name: 'Release That Witch',
          num: 10,
          at: 0
        }
      }),
      fetchMangaDetail: function () {
        fetchedDetail = true
        return Promise.resolve()
      },
      from: 'mangakakalot'
    }

    const activity = new Activity(importer)
    await MangaModel.upsertManga({ name: 'Release That Witch', chapters: [{ num: 10, url: 'dum', at: 0 }] }, 'mangakakalot')
    await activity.refresh()
    assert(!fetchedDetail)
  }))

  it('upserts the new chapters', Mocker.mockIt(async mokr => {
    let fetchedDetail = false
    const importer = {
      allUpdates: _ => Promise.resolve({
        'Release That Witch': {
          name: 'Release That Witch',
          num: 10
        }
      }),
      fetchMangaDetail: function (link, chap) {
        assert.strictEqual(link, 'link')
        fetchedDetail = true
        return Promise.resolve({
          chapters: [
            { num: 8, url: 'dum', at: 0 },
            { num: 9, url: 'dum', at: 2 },
            { num: 10, url: 'dum', at: 4 }
          ],
          manga: chap
        })
      },
      linkFromChap: function (x) {
        assert.strictEqual(x.name, 'Release That Witch')
        return 'link'
      },
      from: 'fanfox'
    }

    const activity = new Activity(importer)
    await MangaModel.upsertManga({ name: 'Release That Witch', chapters: [{ num: 11, url: 'dum', at: 6 }] }, 'fanfox')
    await activity.refresh()
    assert(fetchedDetail)
    const { chapters } = await ChapterModel.findOne()
    assert.strictEqual(chapters.length, 4, 'only replaces missing nums. let old ones be')
    assert.strictEqual(chapters.map(x => x.num).join(','), '11,10,9,8')
    assert.strictEqual(chapters.map(x => x.at).join(','), '6,4,2,0')
  }))

  it('upserts the new chapters if non existing', Mocker.mockIt(async mokr => {
    let fetchedDetail = false
    const importer = {
      allUpdates: _ => Promise.resolve({
        'Release That Witch': {
          name: 'Release That Witch',
          num: 10
        }
      }),
      fetchMangaDetail: function (link, chap) {
        fetchedDetail = true
        return Promise.resolve({
          chapters: [
            { num: 8, url: 'dum', at: 0 },
            { num: 9, url: 'dum', at: 2 },
            { num: 10, url: 'dum', at: 4 }
          ],
          manga: chap
        })
      },
      linkFromChap: function (x) {
        return 'link'
      },
      from: 'fanfox'
    }

    const activity = new Activity(importer)
    await MangaModel.create({ name: 'Release That Witch' })
    await activity.refresh()
    assert(fetchedDetail)
    const { chapters } = await ChapterModel.findOne()
    assert.strictEqual(chapters.length, 3, 'all inserted')
    assert.strictEqual(chapters.map(x => x.num).join(','), '10,9,8')
    assert.strictEqual(chapters.map(x => x.at).join(','), '4,2,0')
  }))

  it('insert from link only', Mocker.mockIt(async mokr => {
    let fetchedDetail = false
    const importer = {
      fetchMangaDetail: function (link, chap) {
        fetchedDetail = true
        return Promise.resolve({
          chapters: [
            { num: 8, url: 'dum', at: 0 },
            { num: 9, url: 'dum', at: 2 },
            { num: 10, url: 'dum', at: 4 }
          ],
          manga: {
            name: 'Release That Witch',
            num: 10
          }
        })
      },
      linkFromChap: function (x) {
        return 'link'
      },
      from: 'fanfox'
    }

    const activity = new Activity(importer)
    await MangaModel.create({ name: 'Release That Witch' })
    await new Promise((resolve, reject) => {
      activity.importLink('xx').on('batchended', resolve)
    })
    assert(fetchedDetail)
    const { chapters } = await ChapterModel.findOne()
    assert.strictEqual(chapters.length, 3, 'all inserted')
    assert.strictEqual(chapters.map(x => x.num).join(','), '10,9,8')
    assert.strictEqual(chapters.map(x => x.at).join(','), '4,2,0')
    const batch = await BatchModel.findOne({ link: 'xx' })
    assert.strictEqual(batch.status, 'OK')
  }))

  it('can fail the batch with reason', Mocker.mockIt(async mokr => {
    const importer = {
      fetchMangaDetail: function (link, chap) {
        return errorHandler.importerRequiresInteraction(link)
      },
      linkFromChap: function (x) {
        return 'link'
      },
      from: 'fanfox'
    }

    const activity = new Activity(importer)
    await new Promise((resolve, reject) => {
      activity.importLink('xx').on('batchended', resolve)
    })
    const batch = await BatchModel.findOne({ link: 'xx' })
    assert.strictEqual(batch.status, 'KO')
    assert.strictEqual(batch.reason, 'requires browser interaction for xx')
  }))

  it('can fail the batch with errors', Mocker.mockIt(async mokr => {
    const importer = {
      fetchMangaDetail: function (link, chap) {
        throw new Error('random error')
      },
      linkFromChap: function (x) {
        return 'link'
      },
      from: 'fanfox'
    }

    const activity = new Activity(importer)
    await new Promise((resolve, reject) => {
      activity.importLink('xx').on('batchended', resolve)
    })
    const batch = await BatchModel.findOne({ link: 'xx' })
    assert.strictEqual(batch.status, 'KO')
    assert.strictEqual(batch.reason, 'random error')
  }))

  it('can fail the batch with string', Mocker.mockIt(async mokr => {
    const importer = {
      fetchMangaDetail: function (link, chap) {
        const e = new Error('random error')
        e.errors = [{ json: true }]
        throw e
      },
      linkFromChap: function (x) {
        return 'link'
      },
      from: 'fanfox'
    }

    const activity = new Activity(importer)
    await new Promise((resolve, reject) => {
      activity.importLink('xx').on('batchended', resolve)
    })
    const batch = await BatchModel.findOne({ link: 'xx' })
    assert.strictEqual(batch.status, 'KO')
    assert.strictEqual(batch.reason, '[{"json":true}]')
  }))
})
