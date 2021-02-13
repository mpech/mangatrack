const mongoose = require('mongoose')
const config = require('../../config')
const appStarter = require('../../lib/appStarter')
const app = require('../../app')
const Singleton = require('../../lib/singleton')
const requester = require('supertest')
const fs = require('fs')
const cheerio = require('cheerio')
const path = require('path')

function dbConnect () {
  if (mongoose.connection && mongoose.connection.constructor.STATES.connected === mongoose.connection._readyState) {
    return Promise.resolve(mongoose.connection)
  }
  return mongoose.connect(config.selectedDb || config.dbTestUrl).then(conn => conn.connection)
};

function dbClose (conn) {
  return conn.close()
};

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

module.exports.bindDb = function () {
  before(function () { return dbSingle.open() })
  after(function () { return dbSingle.close() })
}

module.exports.bindApp = function () {
  before(function () { return appSingle.open(app, exports) })
  after(function () { return appSingle.close() })
}

module.exports.clearColls = function (arr) {
  return function () {
    return Promise.resolve().then(_ => {
      const dfds = arr.map(Model => Model.deleteMany({}))
      return Promise.all(dfds)
    })
  }
}
module.exports.runImport = async function (fn) {
  config.selectedDb = config.dbUrl
  await dbSingle.open()
  try {
    await fn()
  } catch (e) { console.log('runImport', e) }
  return dbSingle.close()
}
module.exports.setTimeout = require('util').promisify(setTimeout)

module.exports.loadDom = async relpath => {
  const file = await fs.promises.readFile(path.resolve(__dirname, `../../samples/${relpath}`))
  return cheerio.load(file.toString(), {
    xml: {
      normalizeWhitespace: true,
      decodeEntities: false
    }
  })
}
