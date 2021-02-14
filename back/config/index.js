'use strict'
const mongoose = require('mongoose')
const path = require('path')
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)

module.exports.port = 4020
module.exports.phase = 'usr'
module.exports.dbUrl = 'mongodb://localhost:27017/mangatrack'
module.exports.dbTestUrl = 'mongodb://localhost:27017/tests'
module.exports.log_fname = path.resolve(__dirname, '../log/%DATE%_mt.log')
module.exports.log_maxsize = 1e5
module.exports.log_lvl = 'usr'
module.exports.reqlogger_maxRequestTime = 1e6// ms
module.exports.pagination_limit = 50
module.exports.oauth2_google_clientId = '936593177518-0spv3m56a0a9nslh6lq669glos9c55na.apps.googleusercontent.com'
module.exports.oauth2_google_secret = 'private'
// this is the redirect callback upon google authorization
module.exports.apiHost = `http://localhost:${exports.port}` // replace in privateConfig.json with your public endpoint
module.exports.oauth2_google_redirect_uri = `${exports.apiHost}/oauth/google/callback`

module.exports.oauth2_facebook_clientId = '2145773262189943'
module.exports.oauth2_facebook_secret = 'private'
module.exports.oauth2_facebook_redirect_uri = `${exports.apiHost}/oauth/facebook/callback`
module.exports.front_login_success = 'https://mangatrack/?access_token={{access_token}}&refresh_token={{refresh_token}}'

module.exports.oauth_accessToken_duration = 7 * 24 * 3600 * 1000// 7days
module.exports.oauth_refreshToken_duration = 14 * 24 * 3600 * 1000

module.exports.oauth2_server = {
  debug: true,
  grants: ['refresh_token'],
  requireClientAuthentication: { refresh_token: false },
  accessTokenLifetime: exports.oauth_accessToken_duration / 1000, // expects second
  refreshTokenLifetime: exports.oauth_refreshToken_duration / 1000
}

module.exports.manga_detailDebounce = 3000
module.exports.nameId_maxLength = 70

module.exports.batch_duration = 3600 * 1000 * 24 // keep 1 day
module.exports.excludeCdnImporter = ['mangakakalot', 'manganelo'] // cdn blocks referrer :(
require('fs').existsSync(path.resolve(__dirname, 'privateConfig.json')) &&
    Object.assign(exports, require(path.resolve(__dirname, 'privateConfig.json')))
const Logger = require('../lib/logger')
module.exports.logger = new Logger({
  fname: exports.log_fname,
  maxsize: exports.log_maxsize,
  loglvl: exports.log_lvl
})
