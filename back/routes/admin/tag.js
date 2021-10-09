import prom from '../../lib/prom.js'
import Formatter from '../../formatters/admin/tagFormatter.js'
import helper from '../../lib/helper.js'
import * as rules from '../../lib/rules.js'
import { validate, Joi } from 'express-validation'
import { runTag } from '../../process/tagProcess.js'

export const load = function (app) {
  app.put('/admin/tags', helper.authenticate, helper.ensureAdmin, validate({
    body: Joi.object({
      word: Joi.string().required(),
      tags: Joi.array().items(rules.tagEnum).required()
    })
  }), prom(async function (req, res) {
    return runTag({ word: req.body.word, tags: req.body.tags }).then(tag => formatter.format(tag))
  }))
}
export const formatter = new Formatter()
export default { load }
