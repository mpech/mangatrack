var bulker = require('../lib/bulker')
var config = require('../config')
var MangaModel = require('../models/mangaModel')

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
  config.logger.inf('detailstack-ok', chapters.length)
  return bulker.debounce(chapters, config.manga_detailDebounce, chap => {
    return this.imp.fetchMangaDetail(chap).then(chapters => {
      return MangaModel.upsertManga({ chapters, ...chap }, this.imp.from).catch(e => {
        config.logger.inf('failed to save', chapters[0], '...')
      })
    }).catch(e => {
      config.logger.inf('failed to fetch detail', e, chap.url)
    })
  })
}

module.exports = ImporterActivity
