var MangaModel = require('../models/mangaModel');
var config = require('../config');
var APH = require('../lib/asyncPromiseHandler');
var ctx = require('../lib/ctx');
var refreshProcess = require('../process/refreshProcess');
var Formatter = require('../formatters/mangaFormatter');
var ChapterFormatter = require('../formatters/chapterFormatter');
var validate = require('express-validation')
var Joi = require('joi');
var prom = require('../lib/prom');

function load(app){
    this.formatter = new Formatter;
    this.chapterFormatter = new ChapterFormatter;

    //tags is not really meant to be supported. sites do it better
    //Just offer the filtering of manhwa...
    //
    //allow to filter by name to follow a specific manga though
    //there is a shitload of filter: type, offset, name, no sort: just timestamp desc
    app.get('/mangas', validate({
        query: {
            name: Joi.string().min(3).max(100),
            type: Joi.string().valid(...MangaModel.schema.tree.type.enum),
            offset: Joi.number().min(0),
            limit: Joi.number().min(1).max(config.pagination_limit),
        }
    }), prom(function(req,res){
        let offset = parseInt(req.query.offset||0);
        let limit = req.query.limit || config.pagination_limit;
        let crit = {};
        if(req.query.name){crit.name = new RegExp(req.query.name, 'i')}
        if(req.query.type){crit.type = req.query.type}

        return Promise.all([
            MangaModel.countDocuments(crit),
            MangaModel.find(crit).sort({updatedAt:-1}).skip(offset).limit(limit).lean().exec()
        ]).then(([count, coll])=>{
            return module.exports.formatter.formatCollection(coll, {count, offset, limit});
        })
    }));

    app.get('/mangas/:nameId/chapters', validate({
        params:{
            nameId: Joi.string().min(3),
        }
    }), prom(function(req,res){

        return MangaModel.findOne({nameId:req.params.nameId}).then(m=>{
            return module.exports.chapterFormatter.formatCollection(m.chapters);
        })
    }));

    app.post('/mangas/refreshs', prom(function(req,res){
        if(req.headers.authorization != config.private_bearer){
            return res.status(401).send({err:'insufficient privileges'})
        }

        APH.tail = refreshProcess.run(Date.now());

        return Promise.resolve({ok:Date.now()})
    }));
}

module.exports = {
    load:load
}