var config = require('../../config');
var assert = require('assert');
var utils = require('../utils/');
var mongoose = require('mongoose');
var MangaModel = require('../../models/mangaModel');
var Mocker = require('../../lib/mocker');
var util = require('util');
var app = {};
var ctx = require('../../lib/ctx');

utils.bindDb();
describe('mangaModel',function(){
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

    it('keeps domain while using mongoose with find', Mocker.mockIt(function(mokr){
        ctx.enable();
        let run = function(str){
            return ctx.initContext(_=>{
                ctx.set('id', str);
                return MangaModel.create({name:'test'+str}).then(p=>{
                    let o = ctx.get();
                    assert.equal(o.id, str);
                    return MangaModel.find().skip(0).limit(1).exec().then(q=>{
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

    it('canonicalize', Mocker.mockIt(function(mokr){
        assert.equal(MangaModel.canonicalize('a b c'), 'a_b_c');
    }));

    it('upsert', Mocker.mockIt(function(mokr){
        return MangaModel.upsertManga({name:'test', chapters:[{num:1, url:'a', at:5}, {num:2, url:'a', at:10}]}).then(_=>{
            return MangaModel.findOne({name:'test'}).then(x=>{
                assert.equal(x.chapters.length, 2);
                assert.equal(x.chapters[0].num, 2);
                assert.equal(x.chapters[0].at, 10);
                assert.equal(x.updatedAt, 10);
            })
        })
    }));

    it('upsert existing updatedAt', Mocker.mockIt(function(mokr){
        return MangaModel.create({name:'test', chapters:[{num:1, url:'a'}]}).then(x=>{
            return MangaModel.upsertManga({nameId:'test', name:'test', chapters:[{num:1, url:'a', at:5}, {num:2, url:'a', at:10}]})
        }).then(_=>{
            return MangaModel.findOne().then(x=>{
                assert.equal(x.chapters.length, 2);
                assert.equal(x.chapters[0].num, 2);
                assert.equal(x.chapters[0].at, 10);
                assert.equal(x.updatedAt, 10);
            })
        })
    }));
});
