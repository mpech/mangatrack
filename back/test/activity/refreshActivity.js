const assert = require('assert')
const utils = require('../utils/')
const Mocker = require('../../lib/mocker')
const Activity = require('../../activity/refreshActivity')
const MangaModel = require('../../models/mangaModel')
const ChapterModel = require('../../models/chapterModel')
const BatchModel = require('../../models/batchModel')
const LinkActivity = require('../../activity/linkActivity')

utils.bindDb()
describe('activity/refreshActivity', function () {
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
      accepts: _ => true,
      from: 'fanfox'
    }

    const activity = new Activity(importer, { fanfox: new LinkActivity(importer) })
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
      accepts: _ => true,
      from: 'fanfox'
    }

    const activity = new Activity(importer, { fanfox: new LinkActivity(importer) })
    await MangaModel.create({ name: 'Release That Witch' })
    await activity.refresh()
    assert(fetchedDetail)
    const { chapters } = await ChapterModel.findOne()
    assert.strictEqual(chapters.length, 3, 'all inserted')
    assert.strictEqual(chapters.map(x => x.num).join(','), '10,9,8')
    assert.strictEqual(chapters.map(x => x.at).join(','), '4,2,0')
  }))
})
