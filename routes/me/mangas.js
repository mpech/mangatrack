var validate = require('express-validation')
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
    }), function(req,res){
        return res.send({ nameId: req.params.nameId, num: 1});
        return req.user.saveManga({nameId:req.params.nameId}).then(m=>{
            return {nameId: req.params.nameId, num: req.params.num}
        }).then(x=>res.send(x)).catch(e=>{
            res.status(500).send(e);
        });
    });

    app.delete('/me/mangas/:nameId'/*, auth*/, validate({
        params:{
            nameId: Joi.string().min(3),
        }
    }), function(req,res){
        return res.send({});
        return req.user.removeManga({nameId: req.params.nameId}).then(m=>{
            return {}
        }).then(x=>res.send(x)).catch(e=>{
            res.status(500).send(e);
        });
    });
}

module.exports = {
    load:load
}