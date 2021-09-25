const BatchModel = require('../../models/batchModel')
const prom = require('../../lib/prom')
const Formatter = require('../../formatters/admin/batchFormatter')
const helper = require('../../lib/helper')
const batchProcess = require('../../process/batchProcess')
const config = require('../../config')
const rules = require('../../lib/rules')
const { validate, Joi } = require('express-validation')
const mongoose = require('mongoose')

function load (app) {
  module.exports.formatter = new Formatter()
  app.get('/admin/batches', helper.authenticate, helper.ensureAdmin, validate({
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
    return module.exports.formatter.formatCollection(coll, { count, offset, limit })
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
    const batch = await run(
      req.body.id || req.body.link,
      Date.now(),
      { refreshThumb, refreshDescription }
    )
    return module.exports.formatter.format(batch)
  }))
}

module.exports = {
  load: load
}
