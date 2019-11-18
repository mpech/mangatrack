var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ModelSchema = new Schema({
    displayName: {type:String, required:true},
    facebookId: String,
    googleId: String,
    createdAt: {type:Number, default:Date.now}
});

module.exports = mongoose.model('User', ModelSchema, 'users');
