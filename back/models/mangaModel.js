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
schema.statics.upsertManga = async function (manga, from) {
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
  let description
  if (manga.description) {
    description = {
      description_content: manga.description,
      description_from: from
    }
  }

  manga.nameId = manga.nameId || this.canonicalize(manga.name)
  let el = await this.findOne({ nameId: manga.nameId })
  if (!el) {
    config.logger.dbg('creating ', manga.nameId)
    el = await this.create({ ...manga, ...lastChap, ...description })
  } else {
    if (el.description_content) {
      description = {}
    }
    if (lastChap.lastChap_num <= el.lastChap_num) {
      lastChap = {}
    }
    const set = { ...lastChap, ...description }
    if (Object.keys(set).length) {
      await this.updateOne(
        { nameId: manga.nameId },
        { $set: set }
      )
    }
  }

  return ChapterModel.upsertChapter({
    mangaId: el._id,
    from,
    chapters: manga.chapters
  })
}

mongooseUtil.setStatic('findOneForSure', schema)

// schema.plugin(require('@mongoosejs/async-hooks'));
module.exports = mongoose.model('Manga', schema, 'mangas')
