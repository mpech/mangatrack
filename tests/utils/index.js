var mongoose = require('mongoose');
var config = require('../../config');
var assert = require('assert');
var exports = module.exports;
var AppStarter = require('../../lib/appStarter');
var appStarter;
exports.waitUntilAppReady = function(app, out){
    appStarter = AppStarter({
        port: config.port,
        dbUrl: config.dbTestUrl,
        logger: config.logger,
        phase: config.phase
    });
    return function(){
        return new Promise((ok,ko)=>{
            appStarter.onReady(function(err, server){
                if(err){return ko(err)}
                exports.requester = require('supertest')(app);
                out.server = server;
                return ok();
            });
            return appStarter.start(app);
        })
    }
};

exports.clearColls = function(arr){
    return function(){
        return Promise.resolve().then(_=>{
            var dfds = arr.map(Model=>Model.deleteMany({}))
            return Promise.all(dfds)
        })
    };
};

exports.dbConnect = function(){
    return new Promise((ok,ko)=>{
        var testUrl = config.dbTestUrl;
        if(mongoose.connection && mongoose.connection.constructor.STATES.connected  == mongoose.connection._readyState){
            return ok();
        }
        return mongoose.connect(config.selectedDb || testUrl, (err,db)=>{
            return err == null?ok():ko(err)
        });
    })
};
exports.dbClose = function(done){
    mongoose.connection.close(done);
};

exports.bindApp = function(){
    var app = require('../../app');
    let out = {};
    before(exports.waitUntilAppReady(app, out));
    after(exports.appClose(app, out));
}
exports.bindBdd = function(){
    before(exports.dbConnect);
    after(exports.dbClose);
}

exports.appClose = function(app, out){
    return function(){
        return new Promise((ok,ko)=>{
            //waitAppReady only fills out once.
            //you just need to shut the server once.
            if(!out.server){
                return ok();
            }
            return out.server.close(function(err){
                if(err)return ko(err);
                return ok();
            });
        })
    }
};

