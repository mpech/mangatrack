var config = require('../../config'); 
var mongoose = require('mongoose');
var utils = require('../utils');
var assert = require('assert');
var Mocker = require('../../lib/mocker');
var AtModel = require('../../models/oauth/atModel');
var RtModel = require('../../models/oauth/rtModel');
var UserModel = require('../../models/userModel');
var passport = require('passport');

utils.bindApp();
describe('e2e oauth', function(){
    beforeEach(utils.clearColls([UserModel, AtModel, RtModel]));

    it('generates token on callback', Mocker.mockIt(function(mokr){
        mokr.mock(passport, 'authenticate', (endpointName, _, cb)=>{
            assert.equal(endpointName, 'google');
            return function(req, res){
                return cb(null, {id:'123', displayName:'Seichiro Kitano'});
            }
        });
        const now = Date.now();
        return utils.requester
            .get('/oauth/google/callback')
            .expect(302)
        .then(function(res){
            return UserModel.findOne({googleId:{$exists:true}}).then(u=>{
                assert(u.googleId.includes('123'));
                assert.equal(u.displayName, 'Seichiro Kitano');
                return u;
            }).then(u=>{
                return Promise.all([
                    AtModel.findOne({userId: u._id}).then(c=>{
                        assert(c);
                        const duration = c.expiresAt.getTime() - now;
                        assert(Math.abs(duration - config.oauth_accessToken_duration) < 1000);
                    }),
                    RtModel.findOne({userId: u._id}).then(c=>{
                        assert(c);
                        const duration = c.expiresAt.getTime() - now;
                        assert(Math.abs(duration - config.oauth_refreshToken_duration) < 1000);
                    })
                ]);
            })
        })
    }))

    it('renew a token', Mocker.mockIt(function(mokr){
        return RtModel.create({
            token:'a',
            userId:'0'.repeat(24)
        }).then(rt=>{
            return utils.requester
                .post('/oauth/token')
                .set({
                    'content-type': 'application/x-www-form-urlencoded',
                }).send({
                    'grant_type': 'refresh_token',
                    'client_id': 'mangatrack',
                    'refresh_token': rt.token
                })
                .expect(200)
            .then(({body})=>{
                return Promise.all([
                    RtModel.findOne({token:'a'}).then(x=>assert(!x)),
                    RtModel.findOne({token:body.refresh_token}).then(x=>assert(x)),
                    AtModel.findOne({token:body.access_token}).then(x=>assert(x)),
                ])
            })  
        })
    }))
});
