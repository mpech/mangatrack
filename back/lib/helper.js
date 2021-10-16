import UserModel from '../models/userModel.js'
import errorHandler from './errorHandler.js'
import OauthService from '../services/oauth.js'
export const ensureAdmin = function (req, res, next) {
  return next(req.user.admin ? null : errorHandler.invalidGrants())
}

const auth = async (req, res, next, opts = {}) => {
  if (!req.headers.authorization) {
    return res.status(400).send('invalid_client')
  }
  const match = req.headers.authorization.match(/^\s*Bearer ([a-zA-Z0-9]{40})$/) // see services/oauth::randomstring. Allow 40 for already issued tokens
  if (!match) {
    res.setHeader('WWW-Authenticate', 'Bearer')
    return res.status(401).send('invalid_request')
  }
  // TODO: crit path
  const { user: { id } } = await OauthService.getAccessToken(match[1])
  const p = UserModel.findOneForSure({ _id: id })
  try {
    const user = await (opts.lean ? p.lean() : p)
    req.user = user
    return next()
  } catch {
    return res.status(400).send('unauthorized_client')
  }
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
