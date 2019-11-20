var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ModelSchema = new Schema({
  displayName: { type: String, required: true },
  facebookId: { type: String, index: true },
  googleId: { type: String, index: true },
  createdAt: { type: Number, default: Date.now },
  mangas: { type: Schema.Types.Map, of: Number, default: _ =>new Map}
})

ModelSchema.methods.saveManga = function ({ nameId, num }) {
    this.mangas.set(nameId, num)
    return this.save().then(m=>{
        return {
            nameId: nameId,
            num: m.mangas.get(nameId)
        }
    })

}

ModelSchema.methods.removeManga = function ({ nameId, num }) {
    this.mangas.delete(nameId)
    return this.save().then(m=>{
        return {}
    })
}
module.exports = mongoose.model('User', ModelSchema, 'users')
