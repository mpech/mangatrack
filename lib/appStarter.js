var mongoose = require('mongoose');
var fs = require("fs");

var expects = {};

var onlyOneCbk;
var STOPPED = 0;
var ONGOING = 1;
var READY = 2;
var status = STOPPED; //nothing, ongoing, ready
var server;

/**
 * call ready with the keys
 * once all keys of keys have been called with ready, a ready event will be emitted
 * 
 * @param  app
 * @param  conf: dbUrl to connect to
 * @return 
 */
module.exports = function(conf){
    var logger = conf.logger;
    var that = {
        allReady:function(){
            return Object.keys(expects).every(function(key){
                return expects[key];
            });
        },
        ready:function(key){
            if(Object.keys(expects).indexOf(key) == -1){
                return console.log('ignoring ',key);
            }
            expects[key] = true;
            if(that.allReady()){
                status = READY;
                console.log('serv start ', new Date());
                fs.readFile("./REVISION", 'utf8', function(err, revision){
                    if(err){return logger.inf('APPVERSION_statup REVISION file NOT FOUND');}
                    logger.inf('APPVERSION_statup', revision);
                });
                onlyOneCbk && onlyOneCbk(null, server);
            }
        },
        start:function(app){
            if(status > 0) return false;
            status = ONGOING;

            expects.bdd = false;
            mongoose.connect(conf.dbUrl);
            that.db = mongoose.connection;

            if(conf.port){
                expects.http = false;
                that.ready('http');
                server = app.listen(conf.port, function(){
                    console.info('http on '+conf.port);
                    app.emit('listening', null);
                    that.ready('http');
                });
            }
            that.db.on('error', function(err){
                var now = new Date();
                logger.err('connection error '+ now.toISOString());
                logger.err(err);
                return console.error('connection error:', err);
            });

            that.db.on('close', function(err){
                if (conf.phase != 'usr'){
                    var now = new Date();
                    logger.err('connection closed '+ now.toISOString());
                    logger.err(err);
                    return console.error('connection closed:', err);
                }
                return err;
            });

            that.db.once('open', function(){
                that.ready('bdd')
            });
        },
        onReady:function(cbk){
            if(status == READY){
                return cbk();
            }
            onlyOneCbk = cbk;
        }
    }
    return that;
}
    
