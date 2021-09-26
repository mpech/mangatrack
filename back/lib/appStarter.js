import mongoose from 'mongoose'
import fs from 'fs'
import Singleton from './singleton.js'
const appSingle = Singleton(function open (app, config) {
  const dfds = []
  if (config.port) {
    dfds.push(new Promise((resolve, reject) => {
      const server = app.listen(config.port, function (err) {
        if (err) {
          return reject(err)
        }
        console.info('http on ' + config.port)
        return resolve(server)
      })
    }))
  }
  // db
  let dfd
  if (mongoose.connection && mongoose.connection.constructor.STATES.connected === mongoose.connection._readyState) {
    dfd = Promise.resolve(mongoose.connection)
  } else {
    dfd = mongoose.connect(config.dbUrl).then(conn => {
      conn.connection.on('error', function (err) {
        const now = new Date()
        config.logger.err('connection error ' + now.toISOString())
        config.logger.err(err)
        return console.error('connection error:', err)
      })
      conn.connection.on('close', function (err) {
        if (config.phase !== 'usr') {
          const now = new Date()
          config.logger.err('connection closed ' + now.toISOString())
          config.logger.err(err)
          return console.error('connection closed:', err)
        }
        return err
      })
      return conn.connection
    })
  }
  dfds.push(dfd)
  return Promise.all(dfds).then(datas => {
    console.log('serv start ', new Date())
    fs.readFile('./REVISION', 'utf8', function (err, revision) {
      if (err) {
        return config.logger.inf('APPVERSION_statup REVISION file NOT FOUND')
      }
      config.logger.inf('APPVERSION_statup', revision)
    })
    return datas
  })
}, function close (closables) {
  return Promise.all(closables.map(x => x.close()))
}, 'app')
export default appSingle
