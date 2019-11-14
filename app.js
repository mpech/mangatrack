var express = require('express');
var config = require('./config');
var appStarter = require('./lib/appStarter');
var bodyParser = require('body-parser');
var ctx = require('./lib/ctx');
var reqLogger = require('./lib/reqlogger');

var app = express();
app.use(bodyParser.json({limit:'1mb'}));
app.use(ctx.express())
app.use(function(req,res,next){
    let o = ctx.get();
    o['x-forwarded-for'] = req.headers['x-forwarded-for'];
    o['pfx'] = req.headers.pfx;
    o['tid'] = req.headers.tid;
    o['sid'] = req.headers.sid;
    o['url'] = req.protocol + '://' + req.get('host') + req.originalUrl;
    return next();
})
app.use(reqLogger.express({
    maxRequestTime: config.reqlogger_maxRequestTime, 
    logger:config.logger
}))

require('./routes').load(app);
app.get('/ping', (req,res)=>res.send('OK'));
app.use(function(err, req, res, next){
    res.status(400).json(err);
});

if(!module.parent){
    appStarter.open(app, config);
    var onDeath = function(signal, e){
        console.log('crashed ('+signal+'):',new Date());
        if(e){
            console.log('e : ', e, e && e.stack);
        }
        return process.exit(1);
    }
    process.on('exit', onDeath.bind(null, 'exit'));
    require('death')({debug: true, uncaughtException: true})(onDeath);
}
module.exports = app;
