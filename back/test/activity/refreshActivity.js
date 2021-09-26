import assert from 'assert'
import utils from '../utils/index.js'
import Mocker from '../../lib/mocker.js'
import Activity from '../../activity/refreshActivity.js'
import MangaModel from '../../models/mangaModel.js'
import ChapterModel from '../../models/chapterModel.js'
import BatchModel from '../../models/batchModel.js'
import LinkActivity from '../../activity/linkActivity.js'

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
