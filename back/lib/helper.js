const UserModel = require('../models/userModel')
const errorHandler = require('../lib/errorHandler')
const OauthService = require('../services/oauth')

module.exports = {
  ensureAdmin: function (req, res, next) {
    return next(req.user.admin ? null : errorHandler.invalidGrants())
  },
  authenticate: (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(400).send('invalid_client')
    }
    const match = req.headers.authorization.match(/^\s*Bearer ([a-zA-Z0-9]{40})$/)// see services/oauth::randomstring. Allow 40 for already issued tokens
    if (!match) {
      res.setHeader('WWW-Authenticate', 'Bearer')
      return res.status(401).send('invalid_request')
    }
    return OauthService.getAccessToken(match[1]).then(({ user: { id } }) => {
      return UserModel.findOneForSure({ _id: id })
    }).then(user => {
      req.user = user
      return next()
    }).catch(e => {
      return res.status(400).send('unauthorized_client')
    })
  }
}
