var config = require('../../config'); 
var mongoose = require('mongoose');
var utils = require('../utils');
var assert = require('assert');
var Mocker = require('../../lib/mocker');
var MangaModel = require('../../models/mangaModel');
var Formatter = require('../../formatters/mangaFormatter');
var ctx = require('../../lib/ctx');

describe('formatter mangaFormatter', function(){

    it('make next link', Mocker.mockIt(function(mokr){
        mokr.pre(_=>ctx.enable())
        mokr.aft(_=>ctx.disable())
        return ctx.initContext(function(){
            ctx.set('url', 'https://random/mangas?offset=0');
            let formatter = new Formatter;
            return formatter.formatCollection([{name:'a', chapters:[]}],{offset:0, limit:1, count:2})
        }).then(res=>{
            assert(res.links.next.includes('?offset=1'), res.links.next);
            assert(!res.links.prev);
        })
    }))

    it('make prev link', Mocker.mockIt(function(mokr){
        mokr.pre(_=>ctx.enable())
        mokr.aft(_=>ctx.disable())
        return ctx.initContext(function(){
            ctx.set('url', 'https://random/mangas?offset=1');
            let formatter = new Formatter;
            return formatter.formatCollection([{name:'a', chapters:[]}],{offset:1, limit:1, count:2})
        }).then(res=>{
            assert(res.links.prev.includes('?offset=0'), res.links.prev);
            assert(!res.links.next);
        })
    }))

    it('make boths', Mocker.mockIt(function(mokr){
        mokr.pre(_=>ctx.enable())
        mokr.aft(_=>ctx.disable())
        return ctx.initContext(function(){
            ctx.set('url', 'https://random/mangas?offset=1&name=2');
            let formatter = new Formatter;
            return formatter.formatCollection([{name:'a', chapters:[]}],{offset:1, limit:1, count:3})
        }).then(res=>{
            assert(res.links.prev.includes('?offset=0&name=2'), res.links.prev);
            assert(res.links.next.includes('?offset=2'), res.links.next);
        })
    }))

    it('appends offset if no offset', Mocker.mockIt(function(mokr){
        mokr.pre(_=>ctx.enable())
        mokr.aft(_=>ctx.disable())
        return ctx.initContext(function(){
            ctx.set('url', 'https://random/mangas');
            let formatter = new Formatter;
            return formatter.formatCollection([{name:'a', chapters:[]}],{offset:0, limit:2, count:3})
        }).then(res=>{
            assert(res.links.next.includes('?offset=2'), res.links.next);
        })
    }))

    it('no fail on trailing?', Mocker.mockIt(function(mokr){
        mokr.pre(_=>ctx.enable())
        mokr.aft(_=>ctx.disable())
        return ctx.initContext(function(){
            ctx.set('url', 'https://random/mangas?');
            let formatter = new Formatter;
            return formatter.formatCollection([{name:'a', chapters:[]}],{offset:0, limit:2, count:3})
        }).then(res=>{
            assert(res.links.next.includes('mangas?offset=2'), res.links.next);
        })
    }))
});
