var assert = require('assert');
var config = require('../../config');
var utils = require('../utils/');
var Logger = require('../../lib/logger');
var Mocker = require('../../lib/mocker');

describe('lib logger',function(){
    before(utils.dbConnect.bind(null,{}));
    after(utils.dbClose);
    beforeEach(utils.clearColls([]));

    it('just logs', Mocker.mockIt(mokr=>{
        //let logger = new Logger({log_fname:config.log_fname, log_maxsize: config.log_maxsize})
        //logger.dbg('a'.repeat(1024));
        //check last logfile
    }));
});
