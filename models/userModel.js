var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ModelSchema = new Schema({
  displayName: { type: String, required: true },
  facebookId: { type: String, index: true },
  googleId: { type: String, index: true },
  createdAt: { type: Number, default: Date.now }
})

module.exports = mongoose.model('User', ModelSchema, 'users')
