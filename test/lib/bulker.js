var assert = require('assert');
var config = require('../../config');
var utils = require('../utils/');
var bulker = require('../../lib/bulker');
var Mocker = require('../../lib/mocker');

describe('lib bulker',function(){

    it('bulk', Mocker.mockIt(mokr=>{
        let arr = [];
        return bulker.bulk([1,2,3], 1, x=>{
            arr.push(x);
            return x;
        }).then(_=>assert.equal(arr.join(','), '1,2,3'));
    }));

    it('bulk truncate last', Mocker.mockIt(mokr=>{
        let arr = [];
        return bulker.bulk([1,2,3], 2, x=>{
            arr.push(x);
            return x;
        }).then(_=>assert.equal(arr.join(','), '1,2,3'));
    }));

    it('debounce', Mocker.mockIt(mokr=>{
        let base = Date.now();
        let old = Date.now()-base;
        let arr = [];
        return bulker.debounce([1,2,3,4], 7, x=>{
            if(x > 1 && x!=4){
                let t = Date.now()-base;
                assert(t-old >= 7, t-old);
                old = t;
            }
            arr.push(x);
            return x;
        }).then(_=>assert.equal(arr.join(','), '1,2,3,4'));
    }));

    it('throttles', Mocker.mockIt(mokr=>{
        let ref = Date.now();
        let arr = [];
        return bulker.throttle([1,2,3,4,5,6], 2,7, x=>{
            arr.push(x);
            return x;
        }).then(_=>{
            assert.equal(arr.join(','), '1,2,3,4,5,6');
            let now = Date.now();
            assert(now-ref>=14);
            assert(now-ref<=18)
        });
    }));
});
