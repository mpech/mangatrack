var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config');

var ModelSchema = new Schema({
    token: {type:String, required:true},
    userId: {type: Schema.Types.ObjectId, required:true},
    expiresAt: {type:Number, default:_=>(Date.now()+config.oauth_refreshToken_duration)},
});

module.exports = mongoose.model('RefreshToken', ModelSchema, 'oauth-refresh-tokens');