var validate = require('express-validation')
var prom = require('../../lib/prom');

//var auth = require('./services/authentification');
var Joi = require('joi');

function load(app){
    app.put('/me/mangas/:nameId'/*, auth*/, validate({
        params:{
            nameId: Joi.string().min(3)
        },
        body:{
            num:Joi.number().min(-1)
        }
    }), prom(function(req,res){
        return req.user.saveManga({nameId:req.params.nameId}).then(m=>{
            return {nameId: req.params.nameId, num: req.params.num}
        })
    }));

    app.delete('/me/mangas/:nameId'/*, auth*/, validate({
        params:{
            nameId: Joi.string().min(3),
        }
    }), prom(function(req,res){
        return req.user.removeManga({nameId: req.params.nameId}).then(m=>{
            return {}
        })
    }));
}

module.exports = {
    load:load
}