var mongoose = require('mongoose')
var Schema = mongoose.Schema
var config = require('../config')
const mongooseUtil = require('../lib/mongooseUtil')

var schema = new Schema({
  nameId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, unique: true, index: true },
  chapters: [{
    url: { type: String, required: true },
    num: { type: Number, required: true },
    at: { type: Number, required: true, default: Date.now }
  }],
  thumbUrl: String,
  updatedAt: { type: Number, default: Date.now, required: true },
  type: { type: String, enum: ['manga', 'manhwa', 'manhua'] }
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
}

schema.statics.findChapter = function (chap) {
  return this.findOne({
    nameId: chap.nameId,
    chapters: {
      $elemMatch: {
        num: chap.num
      }
    }
  })
}

schema.statics.upsertManga = async function (manga) {
  const el = await this.findOne({ nameId: manga.nameId })
  if (!el) {
    config.logger.dbg('creating ', manga.nameId)
    manga.chapters.sort((a, b) => b.num - a.num)
    const updatedAt = manga.chapters.length && manga.chapters[0].at
    return this.create({ ...manga, updatedAt })
  }
  const dic = el.chapters.reduce((acc, chap) => {
    acc[chap.num] = chap
    return acc
  }, {})
  const diff = []
  manga.chapters.forEach(chap => {
    if (!dic[chap.num]) {
      diff.push(chap.num)
    }
    dic[chap.num] = dic[chap.num] || chap
  })
  config.logger.dbg('upserting', el.nameId, diff.map(x => x.num).join(','))
  el.chapters = Object.values(dic).sort((a, b) => b.num - a.num)
  el.markModified('chapters')
  el.updatedAt = el.chapters.length && el.chapters[0].at
  return el.save()
}

mongooseUtil.setStatic('findOneForSure', schema)

// schema.plugin(require('@mongoosejs/async-hooks'));
module.exports = mongoose.model('Manga', schema, 'mangas')
