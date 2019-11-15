/*
just convenient to log stuff in a rotated fashion
 */
var util = require('util');
var winston = require('winston');
require('winston-daily-rotate-file');
var fs = require('fs');
var path = require('path');
var ctx = require('./ctx');

const myFormat = winston.format.printf(({ sLevel, message, label, ts, sid, tid, uid }) => {
    return `[${sLevel}]${ts}|sid:${sid}|tid:${tid}|uid:${uid}>${message}`;
});

class Logger{
    constructor({fname, maxsize, usr}){
        let auditFile = fname.replace(path.basename(fname), '.dailyrotate_conf.json');
        let dir = path.dirname(fname);
        let lastPath = dir+'/last';
        var transport;
        if(!usr){
            transport = new (winston.transports.DailyRotateFile)({
                filename: log_fname,
                datePattern: 'YYYYMMDD_HHmm',
                zippedArchive: true,
                maxSize: maxsize,
                //maxFiles: '14d',
                level:'debug',
                auditFile
            });

            var createSymlink = function(fname){
                fs.symlink(fname, lastPath, _=>{});
            }

            transport.on('rotate', function(oldFilename, newFilename) {
                return fs.lstat(lastPath, function(err, stats){
                    if(err || stats.isSymbolicLink()){
                        return fs.unlink(lastPath, e=>createSymlink(newFilename));
                    }
                    return createSymlink(newFilename);
                })
            });
        }else{
            transport = new winston.transports.File({
                filename: lastPath,
                level:'debug'
            })
        }

        this.logger = winston.createLogger({
            format: myFormat, 
            transports: [
                transport
            ]
        });
    }
}
function twoDigits(s){
    return ('0'+s).substr(-2);
}
Logger.prototype._log = function(lvl, {sLevel, args}){
    let {sid,tid,uid} = ctx.get();
    let d = new Date();
    let [day,mon,h,m,s] = [d.getDate(), d.getMonth()+1, d.getHours(), d.getMinutes(), d.getSeconds()].map(twoDigits)
    let yea = (''+d.getFullYear()).substring(2);
    let ms = ('00'+d.getMilliseconds()).substr(-3);
    let ts = `${day}/${mon}/${yea}_${h}:${m}:${s}.${ms}`
    this.logger.log({
        level:lvl, 
        sLevel,
        message: util.format.apply(console, args), 
        ts,
        sid:sid||'none', 
        tid:tid||'none', 
        uid:uid||'none'
    });
}
Logger.prototype.inf = function(){
   this._log('info', {sLevel: 'INF', args:arguments});
}
Logger.prototype.dbg = function(){
   this._log('debug', {sLevel: 'DBG', args:arguments});
}
Logger.prototype.err = function(){
   this._log('error', {sLevel: 'ERR', args:arguments});
}
Logger.prototype.sta = function(){
   this._log('info', {sLevel: 'STA', args:arguments});
}
module.exports = Logger;