var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config');

var ModelSchema = new Schema({
    token: {type:String, required:true},
    userId: {type: Schema.Types.ObjectId, required:true},
    expiresAt: {type:Date, default:_=>new Date(Date.now()+config.oauth_refreshToken_duration)},
});

ModelSchema.index( { "expiresAt": 1 }, { expireAfterSeconds: 0 } )
module.exports = mongoose.model('RefreshToken', ModelSchema, 'refreshTokens');