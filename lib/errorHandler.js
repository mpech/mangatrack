var config = require('../config')
var express = function (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  if (err.status) {
    try {
      return res.status(err.status).json(err)
    } catch (e) {
      return res.status(err.status).send(err)
    }
  }
  config.logger.dbg('err', err)
  return res.status(500).send('Something broke')
}
module.exports = { express: _ => express }
