const bulker = require('../lib/bulker')
const errorHandler = require('../lib/errorHandler')
const config = require('../config')
const MangaModel = require('../models/mangaModel')
const BatchModel = require('../models/batchModel')
const safeJsonStringify = require('safe-json-stringify')
const APH = require('../lib/asyncPromiseHandler')
const EventEmitter = require('events')

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
    const link = this.imp.linkFromChap(chap)
    return new Promise((resolve, reject) => {
      return this.importLink(link, chap).on('batchended', resolve)
    })
  })
}

ImporterActivity.prototype.importLink = function (link, chap = null) {
  const ev = new EventEmitter()
  let batch
  APH.tail = [
    _ => BatchModel.create({ link }).then(a => { batch = a }),
    _ => ev.emit('batchstarted', batch),
    async _ => {
      let err = null
      try {
        APH.tail = await this.imp.fetchMangaDetail(link, chap).then(({ chapters, manga }) => {
          return MangaModel.upsertManga({ chapters, ...manga }, this.imp.from).catch(e => {
            err = this._shortError(e)
            config.logger.inf('failed to save', chapters[0], '...', err)
          })
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
