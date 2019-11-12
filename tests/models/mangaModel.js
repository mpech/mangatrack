var config = require('../../config');
var assert = require('assert');
var utils = require('../utils/');
var mongoose = require('mongoose');
var MangaModel = require('../../models/mangaModel');
var Mocker = require('../../lib/mocker');
var util = require('util');
var app = {};
var ctx = require('../../lib/ctx');

describe('mangaModel',function(){
    before(utils.dbConnect.bind(null,{}));
    after(utils.dbClose);
    beforeEach(utils.clearColls([MangaModel]));

    it('keeps domain while using mongoose', Mocker.mockIt(function(mokr){
        ctx.enable();
        let run = function(str){
            return ctx.initContext(_=>{
                ctx.set('id', str);
                return MangaModel.create({name:'test'+str}).then(p=>{
                    let o = ctx.get();
                    assert.equal(o.id, str);
                    return MangaModel.findOne().then(q=>{
                        let o = ctx.get();
                        assert.equal(o.id, str);
                    })
                }).then(_=>{
                    let o = ctx.get();
                    assert.equal(o.id, str);
                })
            })
        }
        return Promise.all([
            run('a'),
            run('b')
        ]).finally(_=>{
            ctx.disable();
        })
    }));
});
