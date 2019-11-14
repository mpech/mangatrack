var assert = require('assert');
var config = require('../../config');
var utils = require('../utils/');
var Logger = require('../../lib/logger');
var Mocker = require('../../lib/mocker');
var fs = require('fs');
var util = require('util');
var pread = util.promisify(fs.readFile);
var Importer = require('../../importers/mangakakalot');
var cheerio = require('cheerio');
utils.bindDb();
describe('importers mangakakalot',function(){

    it('allUpdates', Mocker.mockIt(mokr=>{
        let importer = new Importer;
        let called = false;
        mokr.mock(Importer.prototype, 'domFetch', _=>{
            called = true;
            return pread(__dirname+'/../../samples/mangakakalot/main.html').then(s=>{
                return cheerio.load(s.toString(), {
                    xml: {
                      normalizeWhitespace: true,
                      decodeEntities: false
                    }
                })
            });
        })
        mokr.mock(Importer.prototype, 'parseDate', _=>5)
        return importer.allUpdates().then(res=>{
            assert.equal(Object.keys(res).length, 56);
            assert.equal(Object.keys(res)[0], "Girl's World");
            let v = res["Girl's World"];
            assert.equal(v.num, 179);
            assert.equal(v.last, 5);
            assert.equal(v.url, 'https://manganelo.com/chapter/girls_world/chapter_179');
        })
    }));

    it('allUpdates', Mocker.mockIt(mokr=>{
        let importer = new Importer;
        let called = false;
        mokr.mock(Importer.prototype, 'domFetch', _=>{
            called = true;
            return pread(__dirname+'/../../samples/mangakakalot/allUpdates_small.html').then(s=>{
                return cheerio.load(s.toString(), {
                    xml: {
                      normalizeWhitespace: true,
                      decodeEntities: false
                    }
                })
            });
        })
        mokr.mock(Importer.prototype, 'parseDate', _=>5)
        return importer.allUpdates().then(res=>{
            let v = Object.values(res);
            assert.equal(v.length, 1);
            let o = v[0]
            assert.equal(o.num, 18);
        })
    }));

    it('parseDate min ago', Mocker.mockIt(mokr=>{
        let importer = new Importer;
        let ref = new Date(2019,10,13,10)
        let d = new Date(importer.parseDate('42 mins ago', ref.getTime()));
        assert(d.toString().includes('Nov 13 2019 09:18:00'));
        d = new Date(importer.parseDate('2 hour ago', ref.getTime()));
        assert(d.toString().includes('Nov 13 2019 08:00:00'));
        d = new Date(importer.parseDate('11-05 16:04', ref.getTime()));
        assert(d.toString().includes('Nov 05 2019 16:04:00'));
    }));

    it('fetchMangaDetail', Mocker.mockIt(mokr=>{
        let importer = new Importer;
        let called = false;
        mokr.mock(Importer.prototype, 'domFetch', _=>{
            called = true;
            return pread(__dirname+'/../../samples/mangakakalot/detail.html').then(s=>{
                return cheerio.load(s.toString(), {
                    xml: {
                      normalizeWhitespace: true,
                      decodeEntities: false
                    }
                })
            });
        })
        mokr.mock(Importer.prototype, 'parseDate', _=>5)
        return importer.fetchMangaDetail({url:'https://mangakakalot.com/chapter/to_you_the_immortal/chapter_110'}).then(res=>{
            assert.equal(res.length, 117);
            let dic = res.reduce((acc,x)=>(acc[x.num]=1,acc),{});
            for(let i = 1; i<=113; ++i){
                assert(dic[i],' has '+i);
            }
            let c = res[1];
            assert.equal(c.name,'To You, The Immortal Chapter 112.5: Then, Towards the Sunrise (2)');
            assert.equal(c.num,112.5);
            assert.equal(new Date(c.date).toISOString(), '2019-10-19T01:38:00.000Z');
            assert.equal(c.url, 'https://mangakakalot.com/chapter/to_you_the_immortal/chapter_112.5')
        })
    }));
});
