var mongoose = require('mongoose');
var fs = require("fs");
var Singleton = require('./singleton');

let appSingle = Singleton(function open(app, config){
    let dfds = [];
    if(config.port){

        dfds.push( new Promise((ok,ko)=>{
            let server = app.listen(config.port, function(err){
                if(err){return ko(err)}

                console.info('http on '+config.port);
                return ok(server);
            });
        }));
    }
    
    //db
    let dfd;
    if(mongoose.connection && mongoose.connection.constructor.STATES.connected  == mongoose.connection._readyState){
        dfd = Promise.resolve(mongoose.connection);
    }else{
        dfd = mongoose.connect(config.dbUrl).then(conn=>{
            conn.connection.on('error', function(err){
                var now = new Date();
                config.logger.err('connection error '+ now.toISOString());
                config.logger.err(err);
                return console.error('connection error:', err);
            });

            conn.connection.on('close', function(err){
                if (config.phase != 'usr'){
                    var now = new Date();
                    config.logger.err('connection closed '+ now.toISOString());
                    config.logger.err(err);
                    return console.error('connection closed:', err);
                }
                return err;
            });

            return conn.connection;
        });
    }

    
    dfds.push(dfd);

    return Promise.all(dfds).then(datas=>{

        console.log('serv start ', new Date());
        fs.readFile("./REVISION", 'utf8', function(err, revision){
            if(err){return config.logger.inf('APPVERSION_statup REVISION file NOT FOUND');}
            config.logger.inf('APPVERSION_statup', revision);
        });

        return datas;
    })
}, function close(closables){
    return Promise.all(closables.map(x=>x.close()));
}, 'app');
module.exports = appSingle;