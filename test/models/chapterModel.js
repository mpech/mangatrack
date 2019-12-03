const assert = require('assert')
const utils = require('../utils/')
const ChapterModel = require('../../models/chapterModel')
const Mocker = require('../../lib/mocker')

utils.bindDb()
describe('models/chapterModel', function () {
  beforeEach(utils.clearColls([ChapterModel]))

  it('upsert reject if invalid from', Mocker.mockIt(async function (mokr) {
    let called = false
    try {
      await ChapterModel.upsertChapter({ from: 'unknown', chapters: [] })
    } catch (e) {
      assert(e.errors.from.message.includes('unknown` is not a valid enu'))
      called = true
    }
    assert(called)
  }))

  it('upsert reject if missing from', Mocker.mockIt(async function (mokr) {
    let called = false
    try {
      await ChapterModel.upsertChapter({ chapters: [] })
    } catch (e) {
      assert(e.errors.from.message.includes('Path `from` is required'))
      called = true
    }
    assert(called)
  }))
})
