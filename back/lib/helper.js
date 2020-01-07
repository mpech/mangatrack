const UserModel = require('../models/userModel')
const errorHandler = require('../lib/errorHandler')

module.exports = {
  userOnReq: function (req, res, next) {
    return UserModel.findOneForSure({ _id: res.locals.oauth.token.user.id }).then(user => {
      req.user = user
    }).then(_ => next(null)).catch(next)
  },
  ensureAdmin: function (req, res, next) {
    if (req.user.admin) {
      return next(null)
    }
    return next(errorHandler.invalidGrants())
  }
}
