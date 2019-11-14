var MangaModel = require('../models/mangaModel');
var config = require('../config');
var APH = require('../lib/asyncPromiseHandler');
var ctx = require('../lib/ctx');
var refreshProcess = require('../process/refreshProcess');

function load(app){

    app.post('/mangas/refreshs', function(req,res){
        if(req.headers.authorization != config.private_bearer){
            return res.status(401).send({err:'insufficient privileges'})
        }
        //ensure
        let p = refreshProcess.run(Date.now());
        APH.tail = p

        return Promise.resolve().then(_=>{
            return res.send({ok:Date.now()})
        })
    });
}

module.exports = {
    load:load
}