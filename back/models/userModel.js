import mongoose from 'mongoose'
import mongooseUtil from '../lib/mongooseUtil.js'
const Schema = mongoose.Schema
const writeSchema = new Schema({
  updatedAt: { type: Number, required: true, default: Date.now },
  state: { type: String, enum: ['write', 'deleted'], default: 'write' },
  num: { type: Number, required: true }
})
const schema = new Schema({
  displayName: { type: String, required: true },
  facebookId: { type: String, index: true },
  googleId: { type: String, index: true },
  createdAt: { type: Number, default: Date.now },
  mangas: { type: Schema.Types.Map, of: writeSchema, default: _ => new Map() },
  admin: { type: Boolean }
})
schema.methods.saveManga = async function ({ mangaId, num, updatedAt }) {
  this.mangas.set(mangaId.toString(), { _id: mangaId, num, updatedAt })
  const m = await this.save()
  return m.mangas.get(mangaId.toString())
}
schema.methods.removeManga = async function ({ mangaId, updatedAt }) {
  const delta = { state: 'deleted', updatedAt, _id: mangaId }
  if (!this.mangas.has(mangaId.toString())) {
    return delta
  }
  this.mangas.get(mangaId.toString()).set(delta)
  const m = await this.save()
  return m.mangas.get(mangaId.toString())
}
schema.methods.updateMangas = async function (mangas) {
  mangas.forEach(({ mangaId, num, state, updatedAt }) => {
    if (!this.mangas.has(mangaId) || this.mangas.get(mangaId).updatedAt < updatedAt) {
      this.mangas.set(mangaId.toString(), { _id: mangaId, num, state, updatedAt })
    }
  })
  const m = await this.save()
  return m.mangas
}
mongooseUtil.setStatic('findOneForSure', schema)
export default mongoose.model('User', schema, 'users')
