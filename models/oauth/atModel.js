var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config');

var ModelSchema = new Schema({
    token: {type:String, required:true},
    userId: {type: Schema.Types.ObjectId, required:true},
    expiresAt: {type:Number, default:_=>(Date.now()+config.oauth_accessToken_duration)},
});

module.exports = mongoose.model('AccessToken', ModelSchema, 'oauth-access-tokens');