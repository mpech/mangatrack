var bulker = require('../lib/bulker')
var config = require('../config')
var MangaModel = require('../models/mangaModel')

class ImporterActivity {
  constructor (importer) {
    this.imp = importer
  }
}

ImporterActivity.prototype.refresh = async function () {
  // TODO: retry??
  // do not fail all if one fails
  const dic = await this.imp.allUpdates()
  const detailStack = []
  const arr = Object.values(dic)

  await bulker.bulk(arr, 20, chap => {
    // TODO: only one request instead of one foreach chapter
    chap.nameId = MangaModel.canonicalize(chap.name)
    return MangaModel.findChapter(chap).then(yes => {
      if (yes) {
        config.logger.dbg('found', chap.name, chap.num)
        return true
      }
      config.logger.dbg('didnot find', chap)
      return detailStack.push(chap)
    })
  })

  config.logger.dbg('detailstack-ok', detailStack.length)
  return bulker.debounce(detailStack, config.manga_detailDebounce, chap => {
    return this.imp.fetchMangaDetail(chap).then(chapters => {
      return MangaModel.upsertManga({ chapters, ...chap }).catch(e => {
        config.logger.dbg('failed to save', chapters[0], '...')
      })
    }).catch(e => {
      config.logger.inf('failed to fetch detail', e, chap.url)
    })
  })
}
module.exports = ImporterActivity
