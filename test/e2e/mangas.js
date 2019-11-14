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
});
