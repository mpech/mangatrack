var assert = require('assert')
var utils = require('../utils/')
var Mocker = require('../../lib/mocker')
var Activity = require('../../activity/importerActivity')
var MangaModel = require('../../models/mangaModel')

utils.bindDb()
describe('activity importer', function () {
  beforeEach(utils.clearColls([MangaModel]))
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
      }
    }

    const activity = new Activity(importer)
    await MangaModel.create({ name: 'Release That Witch', chapters: [{ num: 10, url: 'dum', at: 0 }] })
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
      fetchMangaDetail: function () {
        fetchedDetail = true
        return Promise.resolve([
          { num: 8, url: 'dum', at: 0 },
          { num: 9, url: 'dum', at: 2 },
          { num: 10, url: 'dum', at: 4 }
        ])
      }
    }
    mokr.mock(MangaModel, 'hasChapter', chap => {
      assert.strictEqual(chap.nameId, MangaModel.canonicalize('Release That Witch'))
      return Promise.resolve(false)
    })

    const activity = new Activity(importer)
    await MangaModel.create({ name: 'Release That Witch', chapters: [{ num: 11, url: 'dum', at: 6 }] })
    await activity.refresh()
    assert(fetchedDetail)
    const m = await MangaModel.findOne()
    assert.strictEqual(m.chapters.length, 4, 'only replaces missing nums. let old ones be')
    assert.strictEqual(m.chapters.map(x => x.num).join(','), '11,10,9,8')
    assert.strictEqual(m.chapters.map(x => x.at).join(','), '6,4,2,0')
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
      fetchMangaDetail: function () {
        fetchedDetail = true
        return Promise.resolve([
          { num: 8, url: 'dum', at: 0 },
          { num: 9, url: 'dum', at: 2 },
          { num: 10, url: 'dum', at: 4 }
        ])
      }
    }
    mokr.mock(MangaModel, 'hasChapter', chap => {
      assert.strictEqual(chap.nameId, MangaModel.canonicalize('Release That Witch'))
      return Promise.resolve(false)
    })

    const activity = new Activity(importer)
    await MangaModel.create({ name: 'Release That Witch', chapters: [{ num: 11, url: 'dum', at: 6 }] })
    await activity.refresh()
    assert(fetchedDetail)
    const m = await MangaModel.findOne()
    assert.strictEqual(m.chapters.length, 4, 'only replaces missing nums. let old ones be')
    assert.strictEqual(m.chapters.map(x => x.num).join(','), '11,10,9,8')
    assert.strictEqual(m.chapters.map(x => x.at).join(','), '6,4,2,0')
  }))
})
