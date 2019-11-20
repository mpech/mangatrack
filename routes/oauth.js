var config = require('../config')
var UserModel = require('../models/userModel')
var OauthService = require('../services/oauth')
var GoogleStrategy = require('passport-google-oauth20').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var passport = require('passport')
var prom = require('../lib/prom')

passport.use(new GoogleStrategy({
  clientID: config.oauth2_google_clientId,
  clientSecret: config.oauth2_google_secret,
  callbackURL: config.oauth2_google_redirect_uri
},
function (accessToken, refreshToken, profile, cb) {
  return cb(null, profile)
}
))

passport.use(new FacebookStrategy({
  clientID: config.oauth2_facebook_clientId,
  clientSecret: config.oauth2_facebook_secret,
  callbackURL: config.oauth2_facebook_redirect_uri,
  profileFields: ['id', 'displayName']
},
function (accessToken, refreshToken, profile, cb) {
  return cb(null, profile)
}
))

function load (app) {
  app.use(passport.initialize())

  function oauth (endpoint) {
    app.get(endpoint.uri, prom(function (req, res) {
      const p = new Promise(function (resolve, reject) {
        try {
          // I don't know why but passport middleware does not callback the next callback.
          // for memory
          // Passport extracts the code from uri,
          // exchange it for a token,
          // ask google the profile from the retrieved token
          // and finally calls use back with google profile
          (passport.authenticate(endpoint.passportName, {}, function (err, data) {
            if (err) { return reject(err) }
            return resolve(data)
          }))(req, res)
        } catch (e) {
          return reject(e)
        }
      })

      return p.then(data => {
        return UserModel.findOneAndUpdate(
          { [endpoint.modelName]: data.id },
          { displayName: data.displayName },
          { new: true, upsert: true })
          .then(u => {
            return OauthService.generateTokens({ id: u._id.toString() })
          }).then(tokens => {
            const url = config.front_login_success
              .replace('{{access_token}}', tokens.access_token)
              .replace('{{refresh_token}}', tokens.refresh_token)
            return res.redirect(url)
          })
      })
    }))
  }

  oauth({
    uri: '/oauth/google/callback',
    modelName: 'googleId',
    passportName: 'google'
  })

  oauth({
    uri: '/oauth/facebook/callback',
    modelName: 'facebookId',
    passportName: 'facebook'
  })

  app.all('/oauth/token', app.oauth.token())
}

module.exports = {
  load: load
}
