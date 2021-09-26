import mongoose from 'mongoose'
import config from '../../config/index.js'
import appStarter from '../../lib/appStarter.js'
import app from '../../app.js'
import Singleton from '../../lib/singleton.js'
import requester from 'supertest'
import fs from 'fs'
import cheerio from 'cheerio'
import path from 'path'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
function dbConnect () {
  if (mongoose.connection && mongoose.connection.constructor.STATES.connected === mongoose.connection._readyState) {
    return Promise.resolve(mongoose.connection)
  }
  return mongoose.connect(config.selectedDb || config.dbTestUrl).then(conn => conn.connection)
}
;
function dbClose (conn) {
  return conn.close()
}
;
function appStarterConnect (app, out) {
  const conf = {
    port: config.port - 1,
    dbUrl: config.dbTestUrl,
    logger: config.logger,
    phase: config.phase
  }
  return appStarter.open(app, conf).then(_ => {
    out.requester = requester(app)
    return appStarter
  })
}
function appStarterClose (appStarter) {
  return appStarter.close()
}
const dbSingle = Singleton(dbConnect, dbClose, 'db')
const appSingle = Singleton(appStarterConnect, appStarterClose, 'appStarter')
export const bindDb = function () {
  before(function () { return dbSingle.open() })
  after(function () { return dbSingle.close() })
}
export const bindApp = function () {
  before(function () { return appSingle.open(app, exports) })
  after(function () { return appSingle.close() })
}
export const clearColls = function (arr) {
  return function () {
    return Promise.resolve().then(_ => {
      const dfds = arr.map(Model => Model.deleteMany({}))
      return Promise.all(dfds)
    })
  }
}
export const runImport = async function (fn) {
  config.selectedDb = config.dbUrl
  await dbSingle.open()
  try {
    await fn()
  } catch (e) {
    console.log('runImport', e)
  }
  return dbSingle.close()
}
export const setTimeout = promisify(global.setTimeout)
export const loadDom = async (relpath) => {
  const DIRNAME = path.dirname(fileURLToPath(import.meta.url))
  const file = await fs.promises.readFile(path.resolve(DIRNAME, `../../samples/${relpath}`))
  return cheerio.load(file.toString(), {
    xml: {
      normalizeWhitespace: true,
      decodeEntities: false
    }
  })
}
const exports = { bindDb, bindApp, clearColls, runImport, setTimeout, loadDom }
export default exports
