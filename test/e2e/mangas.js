var config = require('../../config'); 
var mongoose = require('mongoose');
var utils = require('../utils');
var assert = require('assert');
var Mocker = require('../../lib/mocker');
var MangaModel = require('../../models/mangaModel');
var refreshProcess = require('../../process/refreshProcess');

utils.bindApp();
describe('e2e mangas', function(){
    beforeEach(utils.clearColls([MangaModel]));

    it('refresh', Mocker.mockIt(function(mokr){
        let refreshCalled = false;
        mokr.mock(config, 'private_bearer', 'Bearer xxx');
        mokr.mock(refreshProcess, 'run', _=>{
            refreshCalled = true;
            return Promise.resolve();
        })
        return utils.requester
            .post('/mangas/refreshs')
            .set({Authorization: 'Bearer xxx'})
            .expect(200)
        .then(_=>{
            assert(refreshCalled);
        })
    }))

    it('lists mangas', Mocker.mockIt(function(mokr){
        return utils.requester
            .get('/mangas')
            .expect(200)
        .then(({body})=>{
            assert.equal(body.items.length, 0);
        })
    }))

    it('lists mangas with one existing', Mocker.mockIt(function(mokr){
        return MangaModel.create({name:'a'}).then(m=>{
            return utils.requester
                .get('/mangas')
                .expect(200)
            .then(({body})=>{
                assert.equal(body.items.length, 1);
                let item = body.items[0]
                assert.equal(item.name, 'a');
            })
        })
    }))

    it('lists mangas with one existing and a chapter', Mocker.mockIt(function(mokr){
        return MangaModel.create({name:'a', chapters:[{url:'a',num:0,at:1}]}).then(m=>{
            return utils.requester
                .get('/mangas')
                .expect(200)
            .then(({body})=>{
                assert.equal(body.items.length, 1);
                let item = body.items[0]
                assert.equal(item.name, 'a');
                assert(item.lastChap)
                chap = item.lastChap;
                assert.equal(chap.url, 'a')
                assert.equal(chap.num, 0)
                assert.equal(chap.at, 1)
            })
        })
    }))

    it('paginates mangas, limit 1', Mocker.mockIt(function(mokr){
        return Promise.all([
            MangaModel.create({name:'a', updatedAt:0}),
            MangaModel.create({name:'b', updatedAt:5}),
            MangaModel.create({name:'c', updatedAt:1}),
        ]).then(m=>{
            mokr.mock(config, 'pagination_limit', 1);
            return utils.requester
                .get('/mangas?offset=0')
                .expect(200)
            .then(({body})=>{
                assert.equal(body.items.length, 1);
                let item = body.items[0]
                assert.equal(item.name, 'b');
            })
        })
    }))

    it('paginates mangas, skip 1, limit 2', Mocker.mockIt(function(mokr){
        return Promise.all([
            MangaModel.create({name:'a', updatedAt:0}),
            MangaModel.create({name:'b', updatedAt:5}),
            MangaModel.create({name:'c', updatedAt:1}),
        ]).then(m=>{
            mokr.mock(config, 'pagination_limit', 2);
            return utils.requester
                .get('/mangas?offset=1')
                .expect(200)
            .then(({body})=>{
                assert.equal(body.items.length, 2);
                assert.equal(body.items[0].name, 'c');
                assert.equal(body.items[1].name, 'a');
            })
        })
    }))

    it('paginates mangas, filters by name', Mocker.mockIt(function(mokr){
        return Promise.all([
            MangaModel.create({name:'aaaaaa', updatedAt:0}),
            MangaModel.create({name:'abaaaa', updatedAt:5}),
            MangaModel.create({name:'abcabc', updatedAt:5}),
        ]).then(m=>{
            return utils.requester
                .get('/mangas?name=aaa')
                .expect(200)
            .then(({body})=>{
                assert.equal(body.items.length, 2);
                assert.equal(body.items[0].name, 'abaaaa');
                assert.equal(body.items[1].name, 'aaaaaa');
            })
        })
    }))

    it('lists chapters', Mocker.mockIt(function(mokr){
        return Promise.all([
            MangaModel.create({name:'abc'}),
            MangaModel.create({name:'def', chapters:[{num:0,url:'a',at:3},{num:1,url:'b',at:4}]}),
        ]).then(m=>{
            return utils.requester
                .get('/mangas/def/chapters')
                .expect(200)
            .then(({body})=>{
                assert.equal(body.items.length, 2);
                assert.equal(body.items[0].url, 'a');
                assert.equal(body.items[0].num, 0);
                assert.equal(body.items[0].at, 3);
                assert.equal(body.items[1].url, 'b');
                assert.equal(body.items[1].num, 1);
                assert.equal(body.items[1].at, 4);
            })
        })
    }))
});