import BatchModel from '../../models/batchModel.js'
import prom from '../../lib/prom.js'
import Formatter from '../../formatters/admin/batchFormatter.js'
import helper from '../../lib/helper.js'
import batchProcess from '../../process/batchProcess.js'
import config from '../../config/index.js'
import * as rules from '../../lib/rules.js'
import { validate, Joi } from 'express-validation'
import mongoose from 'mongoose'
export const load = function (app) {
  app.get('/admin/batches', helper.authenticateLean, helper.ensureAdmin, validate({
    query: Joi.object({
      id: Joi.alternatives().try(Joi.array().items(rules.objId), rules.objId),
      offset: Joi.number().min(0),
      limit: Joi.number().min(1).max(config.pagination_limit)
    })
  }), prom(async function (req, res) {
    const offset = parseInt(req.query.offset || 0)
    const limit = parseInt(req.query.limit || config.pagination_limit)
    const crit = {}
    if (req.query.id) {
      let ids = []
      if (typeof (req.query.id) === 'string') {
        ids = mongoose.Types.ObjectId(req.query.id)
      } else {
        ids = req.query.id.map(id => mongoose.Types.ObjectId(id))
      }
      crit._id = { $in: ids }
    }
    const [count, coll] = await Promise.all([
      BatchModel.countDocuments(crit),
      BatchModel.find(crit).sort({ at: -1 }).skip(offset).limit(limit).lean().exec()
    ])
    return formatter.formatCollection(coll, { count, offset, limit })
  }))
  app.post('/admin/batches', helper.authenticate, helper.ensureAdmin, validate({
    body: Joi.alternatives().try({
      link: Joi.string().required(),
      refreshThumb: Joi.boolean(),
      refreshDescription: Joi.boolean()
    }, {
      id: Joi.string().required(),
      refreshThumb: Joi.boolean(),
      refreshDescription: Joi.boolean()
    })
  }), prom(async function (req, res) {
    const refreshThumb = req.body.refreshThumb
    const refreshDescription = req.body.refreshDescription
    const run = req.body.id ? batchProcess.runId : batchProcess.runLink
    const batch = await run(req.body.id || req.body.link, Date.now(), { refreshThumb, refreshDescription })
    return formatter.format(batch)
  }))
}
export const formatter = new Formatter()
export default { load }
