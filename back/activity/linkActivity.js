import errorHandler from '../lib/errorHandler.js'
import config from '../config/index.js'
import MangaModel from '../models/mangaModel.js'
import BatchModel from '../models/batchModel.js'
import safeJsonStringify from 'safe-json-stringify'
import APH from '../lib/asyncPromiseHandler.js'
import EventEmitter from 'events'
class LinkActivity {
  constructor (importer) {
    this.imp = importer
  }
}
LinkActivity.prototype.accepts = function (url) {
  return this.imp.accepts(url)
}
LinkActivity.prototype.importChap = function (chap, options) {
  const link = this.imp.linkFromChap(chap)
  return this.importLink(link, chap, options)
}
/**
 * link: the global one, not the chap link
 */
LinkActivity.prototype.importLink = function (link, chap = null, options = {}) {
  const ev = new EventEmitter()
  let batch
  let mangaRecord = null
  APH.tail = [
    _ => BatchModel.create({ link }).then(a => { batch = a }),
    _ => ev.emit('batchstarted', batch),
    async (_) => {
      let err = null
      try {
        config.logger.dbg('fetching', link)
        const { chapters, manga } = await this.imp.fetchMangaDetail(link, chap)
        mangaRecord = await MangaModel.upsertManga({ chapters, ...manga }, this.imp.from, options).catch(e => {
          err = this._shortError(e)
          config.logger.inf('failed to save', chapters[0], '...', err)
        })
        batch.set('mangaId', mangaRecord._id)
      } catch (e) {
        err = this._shortError(e)
        config.logger.inf('failed to fetch detail', err, chap && chap.url)
      }
      return err
    },
    async (err) => {
      let state
      if (err) {
        const e = this._shortError(err)
        const str = e.reason || (e.errors && safeJsonStringify(e.errors)) || e.message
        state = { status: 'KO', reason: str }
      } else {
        state = { status: 'OK' }
      }
      batch.set(state)
      await batch.save()
      return Object.assign(batch, state)
    },
    _ => ev.emit('batchended', batch)
  ].reduce((acc, f) => acc.then(f), Promise.resolve())
  return ev
}
LinkActivity.prototype._shortError = function (e) {
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
export default LinkActivity
