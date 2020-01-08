const errorHandler = require('../lib/errorHandler')
const config = require('../config')
const MangaModel = require('../models/mangaModel')
const BatchModel = require('../models/batchModel')
const safeJsonStringify = require('safe-json-stringify')
const APH = require('../lib/asyncPromiseHandler')
const EventEmitter = require('events')

class LinkActivity {
  constructor (importer) {
    this.imp = importer
  }
}

LinkActivity.prototype.accepts = function (url) {
  return this.imp.accepts(url)
}

LinkActivity.prototype.importChap = function (chap) {
  const link = this.imp.linkFromChap(chap)
  return this.importLink(link, chap)
}

LinkActivity.prototype.importLink = function (link, chap = null) {
  const ev = new EventEmitter()
  let batch
  APH.tail = [
    _ => BatchModel.create({ link }).then(a => { batch = a }),
    _ => ev.emit('batchstarted', batch),
    async _ => {
      let err = null
      try {
        config.logger.dbg('fetching', link)
        const { chapters, manga } = await this.imp.fetchMangaDetail(link, chap)
        await MangaModel.upsertManga({ chapters, ...manga }, this.imp.from).catch(e => {
          err = this._shortError(e)
          config.logger.inf('failed to save', chapters[0], '...', err)
        })
      } catch (e) {
        err = this._shortError(e)
        config.logger.inf('failed to fetch detail', err, chap && chap.url)
      }
      return err
    },
    async err => {
      let state
      if (err) {
        const e = this._shortError(err)
        const str = e.reason || (e.errors && safeJsonStringify(e.errors)) || e.message
        state = { status: 'KO', reason: str }
      } else {
        state = { status: 'OK' }
      }
      await BatchModel.updateOne({ _id: batch.id }, { $set: state })
      return Object.assign(batch, state)
    },
    _ => ev.emit('batchended', batch)
  ].reduce((acc, f) => {
    return acc.then(res => f(res))
  }, Promise.resolve())

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

module.exports = LinkActivity
