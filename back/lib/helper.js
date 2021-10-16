import UserModel from '../models/userModel.js'
import errorHandler from './errorHandler.js'
import * as OauthService from '../services/oauth.js'
export const ensureAdmin = function (req, res, next) {
  return next(req.user.admin ? null : errorHandler.invalidGrants())
}

const auth = (req, res, next, opts = {}) => {
  if (!req.headers.authorization) {
    return res.status(400).send('invalid_client')
  }
  const match = req.headers.authorization.match(/^\s*Bearer ([a-zA-Z0-9]{40})$/) // see services/oauth::randomstring. Allow 40 for already issued tokens
  if (!match) {
    res.setHeader('WWW-Authenticate', 'Bearer')
    return res.status(401).send('invalid_request')
  }
  // TODO: crit path
  return OauthService.getAccessToken(match[1]).then(({ user: { id } }) => {
    const p = UserModel.findOneForSure({ _id: id })
    return opts.lean ? p.lean() : p
  }).then(user => {
    req.user = user
    return next()
  }).catch(e => {
    return res.status(400).send('unauthorized_client')
  })
}
export const authenticate = (req, res, next) => {
  return auth(req, res, next)
}
export const authenticateLean = (req, res, next) => {
  return auth(req, res, next, { lean: true })
}
export default {
  ensureAdmin,
  authenticate,
  authenticateLean
}
