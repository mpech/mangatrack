'use strict';
exports = module.exports;
let mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

exports.port = 4020;
exports.phase = 'usr';
exports.dbUrl = 'mongodb://localhost:27017/mangatrack';
exports.dbTestUrl = 'mongodb://localhost:27017/tests';
exports.log_fname = require('path').resolve(__dirname+'/../log/%DATE%_mt.log');
exports.log_maxsize = 1e5;
exports.log_usr = true;
exports.reqlogger_maxRequestTime = 1e6;//ms

let Logger = require('../lib/logger');
exports.logger = new Logger({
    fname:exports.log_fname, 
    maxsize: exports.log_maxsize,
    usr: exports.log_usr
})