var express = require('express')
var bodyParser = require('body-parser')
var OAuthServer = require('express-oauth-server')
var cors = require('cors')

var config = require('./config')
var appStarter = require('./lib/appStarter')
var ctx = require('./lib/ctx')
var reqLogger = require('./lib/reqlogger')
var errorHandler = require('./lib/errorHandler')
var OauthService = require('./services/oauth')

var app = express()
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(ctx.express())
app.use(ctx.headers())
app.use(cors())
app.use(reqLogger.express({
  maxRequestTime: config.reqlogger_maxRequestTime,
  logger: config.logger
}))

app.oauth = new OAuthServer({ model: OauthService, ...config.oauth2_server })

require('./routes').load(app)
app.get('/ping', (req, res) => res.send('OK'))
app.use(errorHandler.express())

if (!module.parent) {
  appStarter.open(app, config)
  var onDeath = function (signal, e) {
    console.log('crashed (' + signal + '):', new Date())
    if (e) {
      console.log('e : ', e, e && e.stack)
    }
    return process.exit(1)
  }
  process.on('exit', onDeath.bind(null, 'exit'))
  require('death')({ debug: true, uncaughtException: true })(onDeath)
}
module.exports = app
