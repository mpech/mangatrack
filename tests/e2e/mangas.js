var config = require('../../config'); 
var mongoose = require('mongoose');
var utils = require('../utils');
var assert = require('assert');
var Mocker = require('../../lib/mocker');
var MangaModel = require('../../models/mangaModel');

utils.bindApp();
describe('e2e mangas', function(){
    beforeEach(utils.clearColls([MangaModel]));

    it('list mangas', Mocker.mockIt(function(mokr){
        let payload = {name:'bob', avantage:{percent:20}, restrictions:{'@age':{eq:10}}};
        return utils.requester
            .get('/ping')
            .expect(200)
        .then(function(res){
            console.log('OK ', res.body);
        })
    }))

});
