import prom from '../../lib/prom.js'
import Formatter from '../../formatters/me/meFormatter.js'
import helper from '../../lib/helper.js'
export const load = function (app) {
  app.get('/me', helper.authenticate, prom(async function (req, res) {
    return exports.formatter.format(req.user)
  }))
}
export const formatter = new Formatter()
const exports = { formatter, load }
export default {
  load,
  formatter
}
