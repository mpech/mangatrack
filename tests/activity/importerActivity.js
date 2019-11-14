var assert = require('assert');
var mongoose = require('mongoose');
var config = require('../../config');
var utils = require('../utils/');
var Mocker = require('../../lib/mocker');
var fs = require('fs');
var util = require('util');
var pread = util.promisify(fs.readFile);
var Activity = require('../../activity/importerActivity');
var MangaModel = require('../../models/mangaModel');

utils.bindDb();
describe('activity importer',function(){
    beforeEach(utils.clearColls([MangaModel]))
    it('refreshes with existing manga: nothing happens', Mocker.mockIt(mokr=>{
        let fetchedDetail = false;
        let importer = {
            allUpdates: _=>Promise.resolve({
                'Release That Witch':{
                    name:'Release That Witch',
                    num:10
                }
            }),
            fetchMangaDetail:function(){
                fetchedDetail = true;
                return Promise.resolve();
            }
        };

        let activity = new Activity(importer);
        return MangaModel.create({name:'Release That Witch', chapters:[{num:10, url:'dum'}]}).then(m=>{
            return activity.refresh().then(_=>{
                assert(!fetchedDetail)
            })  
        })
    }));

    it('upserts the new chapters', Mocker.mockIt(mokr=>{
        let fetchedDetail = false;
        let importer = {
            allUpdates: _=>Promise.resolve({
                'Release That Witch':{
                    name:'Release That Witch',
                    num:10
                }
            }),
            fetchMangaDetail:function(){
                fetchedDetail = true;
                return Promise.resolve([
                    {num:8, url:'dum'},
                    {num:9, url:'dum'},
                    {num:10, url:'dum'}
                ]);
            }
        };
        mokr.mock(MangaModel, 'hasChapter', chap=>{
            assert.equal(chap.nameId, MangaModel.canonicalize('Release That Witch'));
            return Promise.resolve(false)
        });

        let activity = new Activity(importer);
        return MangaModel.create({name:'Release That Witch', chapters:[{num:1, url:'dum'}]}).then(m=>{
            return activity.refresh().then(_=>{
                assert(fetchedDetail)
            })
        }).then(_=>{
            return MangaModel.findOne().then(m=>{
                assert.equal(m.chapters.length, 4, 'only replaces missing nums. let old ones be');
                assert.equal(m.chapters.map(x=>x.num).join(','), '1,8,9,10');
            })
        })
    }));
});
