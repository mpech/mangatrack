var mongoose = require('mongoose')
var Schema = mongoose.Schema
const mongooseUtil = require('../lib/mongooseUtil')

var schema = new Schema({
  displayName: { type: String, required: true },
  facebookId: { type: String, index: true },
  googleId: { type: String, index: true },
  createdAt: { type: Number, default: Date.now },
  mangas: { type: Schema.Types.Map, of: Number, default: _ => new Map() }
})

schema.methods.saveManga = async function ({ nameId, num }) {
  this.mangas.set(nameId, num)
  const m = await this.save()
  return {
    nameId: nameId,
    num: m.mangas.get(nameId)
  }
}

schema.methods.removeManga = async function ({ nameId, num }) {
  this.mangas.delete(nameId)
  await this.save()
  return {}
}

schema.methods.saveMangas = async function (mangas) {
  mangas.forEach(({ nameId, num }) => {
    this.mangas.set(nameId, num)
  })
  await this.save()
  return mangas
}

mongooseUtil.setStatic('findOneForSure', schema)

module.exports = mongoose.model('User', schema, 'users')
