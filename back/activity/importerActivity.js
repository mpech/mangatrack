const bulker = require('../lib/bulker')
const errorHandler = require('../lib/errorHandler')
const config = require('../config')
const MangaModel = require('../models/mangaModel')
class ImporterActivity {
  constructor (importer) {
    this.imp = importer
  }
}

ImporterActivity.prototype.refresh = async function () {
  const dic = await this.imp.allUpdates()
  const chapters = await this.buildMissingChapters(dic)
  return this.upsertChapters(chapters)
}

ImporterActivity.prototype.buildMissingChapters = async function (dic) {
  const chapters = []
  const arr = Object.values(dic)
  await bulker.bulk(arr, 20, chap => {
    chap.nameId = MangaModel.canonicalize(chap.name)
    return MangaModel.findChapter(chap, this.imp.from).then(yes => {
      if (yes) {
        config.logger.dbg('found', chap.name, chap.num)
        return true
      }
      config.logger.dbg('didnot find', chap)
      return chapters.push(chap)
    })
  })
  return chapters
}

ImporterActivity.prototype.upsertChapters = async function (chapters) {
  config.logger.inf(`will upsert ${chapters.length} chapters`)
  return bulker.debounce(chapters, config.manga_detailDebounce, chap => {
    return this.imp.fetchMangaDetail(chap).then(chapters => {
      return MangaModel.upsertManga({ chapters, ...chap }, this.imp.from).catch(e => {
        e = this._shortError(e)
        config.logger.inf('failed to save', chapters[0], '...', e)
      })
    }).catch(e => {
      e = this._shortError(e)
      config.logger.inf('failed to fetch detail', e, chap.url)
    })
  })
}

ImporterActivity.prototype._shortError = function (e) {
  // only log one chapter error
  if (e.name === 'ValidationError') {
    e.errors = Object.keys(e.errors).reduce((acc, errName) => {
      const fieldPath = errName.split('.')[0]
      acc[fieldPath] = acc[fieldPath] || e.errors[errName]
      return acc
    }, {})
  }

  if (e instanceof errorHandler.MangaTrackError) {
    e = { reason: e.reason }
  }

  return e
}
module.exports = ImporterActivity
