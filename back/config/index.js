'use strict'
exports = module.exports
const mongoose = require('mongoose')
const path = require('path')
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)

exports.port = 4020
exports.phase = 'usr'
exports.dbUrl = 'mongodb://localhost:27017/mangatrack'
exports.dbTestUrl = 'mongodb://localhost:27017/tests'
exports.log_fname = path.resolve(__dirname, '../log/%DATE%_mt.log')
exports.log_maxsize = 1e5
exports.log_lvl = 'usr'
exports.reqlogger_maxRequestTime = 1e6// ms
exports.pagination_limit = 50
exports.oauth2_google_clientId = '936593177518-0spv3m56a0a9nslh6lq669glos9c55na.apps.googleusercontent.com'
exports.oauth2_google_secret = 'private'
// this is the redirect callback upon google authorization
exports.oauth2_google_redirect_uri = `http://localhost:${exports.port}/oauth/google/callback`

exports.oauth2_facebook_clientId = '2145773262189943'
exports.oauth2_facebook_secret = 'private'
exports.oauth2_facebook_redirect_uri = `http://localhost:${exports.port}/oauth/facebook/callback`
exports.front_login_success = 'http://mangatrack/?access_token={{access_token}}&refresh_token={{refresh_token}}'

exports.oauth_accessToken_duration = 7 * 24 * 3600 * 1000// 7days
exports.oauth_refreshToken_duration = 14 * 24 * 3600 * 1000

exports.oauth2_server = {
  debug: true,
  grants: ['refresh_token'],
  requireClientAuthentication: { refresh_token: false },
  accessTokenLifetime: exports.oauth_accessToken_duration / 1000, // expects second
  refreshTokenLifetime: exports.oauth_refreshToken_duration / 1000
}

exports.manga_detailDebounce = 3000
exports.nameId_maxLength = 70

require('fs').existsSync(path.resolve(__dirname, 'privateConfig.json')) &&
    Object.assign(exports, require(path.resolve(__dirname, 'privateConfig.json')))
const Logger = require('../lib/logger')
exports.logger = new Logger({
  fname: exports.log_fname,
  maxsize: exports.log_maxsize,
  loglvl: exports.log_lvl
})
