var MangaModel = require('../models/mangaModel');
var config = require('../config');

var ctx = require('../lib/ctx');
function load(app){

    app.get('/mangas', function(req,res){
        return MangaModel.find().then(res=>{
            config.logger.dbg('res', 2);
            return {"ok":true};
        }).then(_=>{
            res.end(('end'))
        }).catch(e=>{

            res.end(('e'))
        })
    });
}

module.exports = {
    load:load
}