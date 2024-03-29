import util from 'util'
import winston from 'winston'
import 'winston-daily-rotate-file'
import path from 'path'
import ctx from './ctx.js'
const myFormat = winston.format.printf(({ sLevel, message, label, ts, sid, tid, uid }) => {
  return `[${sLevel}]${ts}|sid:${sid}|tid:${tid}|uid:${uid}>${message}`
})
class Logger {
  constructor ({ fname, maxsize, loglvl }) {
    const auditFile = fname.replace(path.basename(fname), '.dailyrotate_conf.json')
    const dir = path.dirname(fname)
    const lastPath = dir + '/last'
    let transport
    if (loglvl !== 'usr') {
      transport = new (winston.transports.DailyRotateFile)({
        filename: fname,
        datePattern: 'YYYYMMDD_HH',
        zippedArchive: true,
        maxSize: maxsize,
        // maxFiles: '14d',
        level: 'info',
        auditFile,
        createSymlink: true,
        symlinkName: 'last'
      })
    } else {
      transport = new winston.transports.File({
        filename: lastPath,
        level: 'debug'
      })
    }
    this.logger = winston.createLogger({
      format: myFormat,
      transports: [
        transport
      ]
    })
  }
}
function twoDigits (s) {
  return ('0' + s).substr(-2)
}
Logger.prototype._log = function (lvl, { sLevel, args }) {
  const { sid, tid, uid } = ctx.get()
  const d = new Date()
  const [day, mon, h, m, s] = [d.getDate(), d.getMonth() + 1, d.getHours(), d.getMinutes(), d.getSeconds()].map(twoDigits)
  const yea = ('' + d.getFullYear()).substring(2)
  const ms = ('00' + d.getMilliseconds()).substr(-3)
  const ts = `${day}/${mon}/${yea}_${h}:${m}:${s}.${ms}`
  this.logger.log({
    level: lvl,
    sLevel,
    message: util.format.apply(console, args),
    ts,
    sid: sid || 'none',
    tid: tid || 'none',
    uid: uid || 'none'
  })
}
Logger.prototype.inf = function () {
  this._log('info', { sLevel: 'INF', args: arguments })
}
Logger.prototype.dbg = function () {
  this._log('debug', { sLevel: 'DBG', args: arguments })
}
Logger.prototype.err = function () {
  this._log('error', { sLevel: 'ERR', args: arguments })
}
Logger.prototype.sta = function () {
  this._log('info', { sLevel: 'STA', args: arguments })
}
export default Logger
