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

schema.methods.saveManga = async function ({ mangaId, num }) {
  this.mangas.set(mangaId.toString(), num)
  const m = await this.save()
  return {
    mangaId,
    num: m.mangas.get(mangaId.toString())
  }
}

schema.methods.removeManga = async function ({ mangaId, num }) {
  this.mangas.delete(mangaId.toString())
  await this.save()
  return {}
}

schema.methods.updateMangas = async function (mangas) {
  mangas.forEach(({ mangaId, num }) => {
    if (!this.mangas.has(mangaId) || this.mangas.get(mangaId) < num ) {
      this.mangas.set(mangaId.toString(), num)
    }
  })
  await this.save()
  return mangas
}

mongooseUtil.setStatic('findOneForSure', schema)

module.exports = mongoose.model('User', schema, 'users')
