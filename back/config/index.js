import path from 'path'
import { existsSync } from 'fs'
import { loadJsonFileSync } from 'load-json-file'
import { fileURLToPath } from 'url'
import Logger from '../lib/logger.js'

const DIRNAME = path.dirname(fileURLToPath(import.meta.url))
const exports = {}
exports.port = 4020
exports.phase = 'usr'
exports.dbUrl = 'mongodb://127.0.0.1:27017/mangatrack?maxPoolSize=100'
exports.dbTestUrl = 'mongodb://127.0.0.1:27017/tests'
exports.log_fname = path.resolve(DIRNAME, '../log/%DATE%_mt.log')
exports.log_maxsize = 1e5
exports.log_lvl = 'usr'
exports.reqlogger_maxRequestTime = 1e6// ms
exports.pagination_limit = 50
exports.oauth2_google_clientId = '936593177518-0spv3m56a0a9nslh6lq669glos9c55na.apps.googleusercontent.com'
exports.oauth2_google_secret = 'private'
// when not using a subdomain but a vpath, incoming url holds ^/api (no need to proxy rewrite)
exports.mountpath = false // '/api'
// this is the redirect callback upon google authorization
exports.apiEndpoint = `http://localhost:${exports.port}${exports.mountpath ? exports.mountpath : ''}` // replace in privateConfig.json with your public endpoint
exports.oauth2_google_redirect_uri = `${exports.apiEndpoint}/oauth/google/callback`

exports.oauth2_facebook_clientId = '2145773262189943'
exports.oauth2_facebook_secret = 'private'
exports.oauth2_facebook_redirect_uri = `${exports.apiEndpoint}/oauth/facebook/callback`
exports.front_login_success = 'https://mangatrack/?access_token={{access_token}}&refresh_token={{refresh_token}}'

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

exports.batch_duration = 3600 * 1000 * 24 // keep 1 day
exports.excludeCdnImporter = ['mangakakalot', 'manganelo'] // cdn blocks referrer :(
exports.force_app_run = 'plzGiveUsMetaParent_orSomething'
exports.cors_maxAge = 24 * 3600
const jsonPath = path.join(DIRNAME, 'privateConfig.json')
Object.assign(exports, existsSync(jsonPath) ? loadJsonFileSync(jsonPath) : {})
exports.logger = new Logger({
  fname: exports.log_fname,
  maxsize: exports.log_maxsize,
  loglvl: exports.log_lvl
})

export default exports
