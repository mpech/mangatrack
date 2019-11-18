var express = require('express');
var config = require('./config');
var appStarter = require('./lib/appStarter');
var bodyParser = require('body-parser');
var ctx = require('./lib/ctx');
var reqLogger = require('./lib/reqlogger');
var cors = require('cors');
var errorHandler = require('./lib/errorHandler');
//var oauthModel = require('./services/oauth.js');
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
app.use(cors())
app.use(reqLogger.express({
    maxRequestTime: config.reqlogger_maxRequestTime, 
    logger:config.logger
}))


//app.oauth = require('oauth2-server')({model:oauthModel,...config.oauth2_server});
//only supports refresh_token, no credentials
//get mandatory.
//app.get('/oauth/token', app.oauth.grant());
//app.post('/oauth/token', app.oauth.grant());
//exchange an oauth code for an acess token

require('./routes').load(app);
app.get('/ping', (req,res)=>res.send('OK'));
app.use(errorHandler.express());

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
