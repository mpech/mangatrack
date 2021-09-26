import assert from 'assert'
import utils from '../utils/index.js'
import Mocker from '../../lib/mocker.js'
import Activity from '../../activity/linkActivity.js'
import MangaModel from '../../models/mangaModel.js'
import ChapterModel from '../../models/chapterModel.js'
import BatchModel from '../../models/batchModel.js'
import errorHandler from '../../lib/errorHandler.js'

utils.bindDb()
describe('activity/refreshActivity', function () {
  beforeEach(utils.clearColls([MangaModel, ChapterModel, BatchModel]))
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
      accepts: _ => true,
      from: 'fanfox'
    }

    const activity = new Activity(importer)
    const manga = await MangaModel.create({ name: 'Release That Witch' })
    const backBatch = await new Promise((resolve, reject) => {
      activity.importLink('xx').on('batchended', resolve)
    })
    assert(manga._id.equals(backBatch.mangaId))
    assert.strictEqual(backBatch.link, 'xx')
    assert(fetchedDetail)
    const { chapters } = await ChapterModel.findOne()
    assert.strictEqual(chapters.length, 3, 'all inserted')
    assert.strictEqual(chapters.map(x => x.num).join(','), '10,9,8')
    assert.strictEqual(chapters.map(x => x.at).join(','), '4,2,0')
    const batch = await BatchModel.findOne({ link: 'xx' })
    assert.strictEqual(batch.status, 'OK')
    assert.strictEqual(batch.__v, 1)
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
