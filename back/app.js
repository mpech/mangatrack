import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import config from './config/index.js'
import appStarter from './lib/appStarter.js'
import ctx from './lib/ctx.js'
import { express as expressLog } from './lib/reqlogger.js'
import errorHandler from './lib/errorHandler.js'
import { load } from './routes/index.js'
import death from 'death'
import { fileURLToPath } from 'url'

const app = express()
app.enable('trust proxy')
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(ctx.express())
app.use(ctx.headers())
app.use(cors())
app.use(expressLog({
  maxRequestTime: config.reqlogger_maxRequestTime,
  logger: config.logger
}));
({ load }.load(app))
app.get('/ping', (req, res) => res.send('OK'))
app.use(errorHandler.express())
if (process.argv[1] === fileURLToPath(import.meta.url) || typeof (process.env[config.force_app_run]) !== 'undefined') {
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
  death({ debug: true, uncaughtException: true })(onDeath)
}
export default app
