const prom = require('../../lib/prom')
const Formatter = require('../../formatters/me/meFormatter')
const helper = require('../../lib/helper')

function load (app) {
  module.exports.formatter = new Formatter()
  app.get('/me', helper.authenticate, prom(async function (req, res) {
    return module.exports.formatter.format(req.user)
  }))
}

module.exports = {
  load: load
}
