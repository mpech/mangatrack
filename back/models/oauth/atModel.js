import mongoose from 'mongoose'
import config from '../../config/index.js'
const Schema = mongoose.Schema
const ModelSchema = new Schema({
  token: { type: String, required: true, index: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  expiresAt: { type: Date, default: _ => new Date(Date.now() + config.oauth_accessToken_duration) }
})
ModelSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
export default mongoose.model('AccessToken', ModelSchema, 'accessTokens')
