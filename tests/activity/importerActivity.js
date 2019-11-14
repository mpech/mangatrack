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
        mokr.mock(MangaModel, 'hasChapter', chap=>{
            assert.equal(chap.nameId, MangaModel.canonicalize('Release That Witch'));
            return Promise.resolve(true)
        });

        let activity = new Activity(importer);
        return MangaModel.create({name:'Release That Witch', chapters:[{num:10, url:'dum'}]}).then(m=>{
            return activity.refresh().then(_=>{
                assert(!fetchedDetail)
            })  
        })
    }));
});
