var AtModel = require('../models/oauth/atModel');
var RtModel = require('../models/oauth/rtModel');
module.exports = {
    createTokens: function(user){
        return Promise.resolve({
            access_token:'123',
            refresh_token:'456'
        });
        return Promise.all([
            AtModel.create({userId: user._id})
        ])
    }
}