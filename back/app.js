const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const config = require('./config')
const appStarter = require('./lib/appStarter')
const ctx = require('./lib/ctx')
const reqLogger = require('./lib/reqlogger')
const errorHandler = require('./lib/errorHandler')

const app = express()
app.enable('trust proxy')
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(ctx.express())
app.use(ctx.headers())
app.use(cors())
app.use(reqLogger.express({
  maxRequestTime: config.reqlogger_maxRequestTime,
  logger: config.logger
}))

require('./routes').load(app)
app.get('/ping', (req, res) => res.send('OK'))
app.use(errorHandler.express())

if (!module.parent) {
  appStarter.open(app, config)
  config.logger.inf('started', new Date())
  const onDeath = function (signal, e) {
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
