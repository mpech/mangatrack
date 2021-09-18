const config = require('../config')
const Joi = require('joi')
const validate = require('express-validation')
const UserModel = require('../models/userModel')
const OauthService = require('../services/oauth')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const passport = require('passport')
const prom = require('../lib/prom')
const Formatter = require('../formatters/oauthFormatter')

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
  this.formatter = new Formatter()
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

      return p.then(async data => {
        const u = await UserModel.findOneAndUpdate(
          { [endpoint.modelName]: data.id },
          { displayName: data.displayName },
          { new: true, upsert: true })

        const { accessToken, refreshToken } = await OauthService.generateTokens({ id: u._id.toString() })
        const myURL = new URL(req.query.state || config.front_login_success)
        myURL.searchParams.append('access_token', accessToken)
        myURL.searchParams.append('refresh_token', refreshToken)
        return res.redirect(myURL.href)
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

  app.post('/oauth/token', validate({
    body: {
      grant_type: Joi.string().valid('refresh_token').required(),
      refresh_token: Joi.string().max(100).required()
    }
  }), prom(async req => {
    const { refresh_token: token } = req.body
    const rt = await OauthService.getRefreshToken(token)
    const [, tokens] = await Promise.all([
      OauthService.revokeToken(rt),
      OauthService.generateTokens(rt.user)
    ])
    return this.formatter.formatRefresh(tokens)
  }))
}

module.exports = {
  load: load
}
