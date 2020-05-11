const mongoose = require('mongoose')
const Schema = mongoose.Schema
const config = require('../config')
const mongooseUtil = require('../lib/mongooseUtil')
const ChapterModel = require('./chapterModel')
const errorHandler = require('../lib/errorHandler')

const schema = new Schema({
  nameId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, unique: true, index: true },
  thumbUrl: String,
  type: { type: String, enum: ['manga', 'manhwa', 'manhua'] },
  lastChap_at: { type: Number, default: Date.now, required: true },
  // simplify the update query, assuming no chap will be negative
  lastChap_num: { type: Number, default: -1 },
  lastChap_url: { type: String },
  description_content: String,
  description_from: String
})

schema.pre('validate', function () {
  if (!this.nameId) {
    this.nameId = this.constructor.canonicalize(this.name || '')
  }
  return Promise.resolve()
})

schema.statics.canonicalize = function (s) {
  return s
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .substring(0, config.nameId_maxLength)
    .toLowerCase()
}

schema.statics.findChapter = async function ({ nameId, _id, num }, from) {
  const m = await this.findOne(_id ? { _id } : { nameId }).select('_id').lean()
  if (!m) {
    return null
  }
  const pred = {
    mangaId: m._id,
    chapters: {
      $elemMatch: {
        num
      }
    }
  }
  if (from !== '*') {
    pred.from = from
  }
  return mongoose.model('Chapter').findOne(pred)
}

/**
 * @param  {nameId, name, thumbUrl, chapters} manga
 * description facultative, if given, description_from will be field based on from
 * @from MUST be a valid enum from ChapterModel
 * Assumes chapter is sorted by num desc
 * @return {[type]}       [description]
 */
schema.statics.upsertManga = async function (manga, from, options = { refreshThumb: false, refreshDescription: false }) {
  {
    // run the validator over 'from' field
    const b = new ChapterModel({ from, mangaId: '0'.repeat(24) })
    const err = b.validateSync()
    if (err) {
      throw err
    }
  }

  if (!manga.chapters.length) {
    throw errorHandler.noEmptyManga(manga.nameId)
  }

  let lastChap = {
    lastChap_num: manga.chapters[0].num,
    lastChap_url: manga.chapters[0].url,
    lastChap_at: manga.chapters[0].at
  }
  const facultativeProps = {
    description_content: manga.description,
    description_from: from,
    thumbUrl: manga.thumbUrl
  }

  manga.nameId = manga.nameId || this.canonicalize(manga.name)
  let el = await this.findOne({ nameId: manga.nameId })
  if (!el) {
    config.logger.dbg('creating ', manga.nameId)
    el = await this.create({ ...manga, ...lastChap, ...facultativeProps })
  } else {
    // set the NEW property if it exists and (we are allowed to do so (refresh option) or it does not exist yet)
    // by default it is set, so do the negation
    if (!(facultativeProps.thumbUrl && (!el.thumbUrl || options.refreshThumb))) {
      delete facultativeProps.thumbUrl
    }
    if (!(facultativeProps.description_content && (!el.description_content || options.refreshDescription))) {
      delete facultativeProps.description_content
      delete facultativeProps.description_from
    }
    if (lastChap.lastChap_num <= el.lastChap_num) {
      lastChap = {}
    }
    const set = { ...lastChap, ...facultativeProps }
    if (Object.keys(set).length) {
      el = Object.assign(el, set)
      await this.updateOne(
        { nameId: manga.nameId },
        { $set: set }
      )
    }
  }

  await ChapterModel.upsertChapter({
    mangaId: el._id,
    from,
    chapters: manga.chapters
  })
  return el
}

mongooseUtil.setStatic('findOneForSure', schema)

// schema.plugin(require('@mongoosejs/async-hooks'));
module.exports = mongoose.model('Manga', schema, 'mangas')
