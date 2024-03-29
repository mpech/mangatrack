import mongoose from 'mongoose'
import config from '../config/index.js'
import mongooseUtil from '../lib/mongooseUtil.js'
const Schema = mongoose.Schema
const schema = new Schema({
  link: { type: String, required: true },
  at: { type: Number, default: Date.now },
  expiresAt: { type: Date, default: _ => new Date(Date.now() + config.batch_duration) },
  status: { type: String, enum: ['OK', 'KO', 'PENDING'], default: 'PENDING' },
  reason: { type: String },
  mangaId: { type: String }
})
mongooseUtil.setStatic('findOneForSure', schema)
schema.pre('save', function (next) {
  this.increment()
  return next()
})
schema.index({ at: 1 })
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
export default mongoose.model('Batch', schema, 'batches')
