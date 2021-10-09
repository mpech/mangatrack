import mongoose from 'mongoose'
const Schema = mongoose.Schema
const schema = new Schema({
  word: { type: String, required: true, unique: true, index: true },
  tags: { type: [{ type: String, enum: ['jn', 'cn', 'kr'] }] }
})
export default mongoose.model('Tag', schema, 'tags')
