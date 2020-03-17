const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  mangaId: { type: mongoose.Types.ObjectId, required: true, index: true },
  from: { type: String, required: true, enum: ['mangakakalot', 'manganelo', 'fanfox'] },
  // Ideas of such format is
  // 1 - to allow factorization of link for a given <mangaId, from>
  // Observation is that for a given manga, url prefix seems to always be the
  // same which could long-term allow to ignore the chapters.url property
  //
  // 2 - in case of a buggy import, to keep the debugging of records easy via
  // the 'from' key instead of
  // aggregating everything to manga
  chapters: [{
    url: { type: String, required: true },
    num: { type: Number, required: true },
    at: { type: Number, required: true, default: Date.now }
  }]
})

function sortWithNoDupes (chapters) {
  const dic = chapters.reduce((acc, chap) => {
    acc[chap.num] = chap
    return acc
  }, {})
  return Object.values(dic).sort((a, b) => b.num - a.num)
}
schema.statics.upsertChapter = async function ({ mangaId, from, chapters }) {
  const c = await this.findOne({ mangaId, from })
  if (!c) {
    return this.create({ mangaId, from, chapters: sortWithNoDupes(chapters) })
  }
  c.chapters = sortWithNoDupes(c.chapters.concat(chapters))
  return c.save()
}
module.exports = mongoose.model('Chapter', schema, 'chapters')
