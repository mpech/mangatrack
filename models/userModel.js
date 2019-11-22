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
  const back = []
  mangas.forEach(({ nameId, num }) => {
    let n = num
    if (this.mangas.has(nameId)) {
      /*
      We assume that a user does not want to unread a chapter
      But most likely he forgot to login and randomly clicked even though
      he actually did read the chapter
       */
      n = num === -1 ? num : Math.max(this.mangas.get(nameId), num)
    }
    this.mangas.set(nameId, n)
    back.push({ nameId, num: n })
  })
  await this.save()
  return back
}

mongooseUtil.setStatic('findOneForSure', schema)

module.exports = mongoose.model('User', schema, 'users')