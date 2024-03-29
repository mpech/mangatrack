import bulker from '../lib/bulker.js'
import config from '../config/index.js'
import MangaModel from '../models/mangaModel.js'

class RefreshActivity {
  constructor (importer, fromToLinkActivity) {
    this.imp = importer
    this.activities = fromToLinkActivity
  }
}

RefreshActivity.prototype.refresh = async function () {
  const dic = await this.imp.allUpdates()
  const chapters = await this.buildMissingChapters(dic)
  return this.upsertChapters(chapters)
}

RefreshActivity.prototype.buildMissingChapters = async function (dic) {
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

RefreshActivity.prototype.upsertChapters = async function (chapters) {
  config.logger.inf(`will upsert ${chapters.length} chapters`)
  return bulker.debounce(chapters, config.manga_detailDebounce, chap => {
    const activity = Object.values(this.activities).find(x => x.accepts(chap.url))
    if (!activity) {
      config.logger.inf('could not process', chap.url)
      return Promise.resolve()
    }

    const refreshThumb = config.excludeCdnImporter.every(x => !this.imp.from.includes(x)) // no-refererrer...
    const ev = activity.importChap(chap, { refreshThumb })

    return new Promise((resolve, reject) => {
      return ev.on('batchended', resolve)
    })
  })
}
export default RefreshActivity
