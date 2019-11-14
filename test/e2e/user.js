var config = require('../../config'); 
var mongoose = require('mongoose');
var utils = require('../utils');
var assert = require('assert');
var Mocker = require('../../lib/mocker');
var MangaModel = require('../../models/mangaModel');

utils.bindApp();
describe('e2e user', function(){
    beforeEach(utils.clearColls([MangaModel]));

    it.skip('list user', Mocker.mockIt(function(mokr){
        let payload = {name:'bob', avantage:{percent:20}, restrictions:{'@age':{eq:10}}};
        return utils.requester
            .get('/mangas')
            .expect(200)
        .then(function(res){
            console.log('OK ', res.body);
        })
    }))

});
