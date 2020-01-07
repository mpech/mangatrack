const BatchModel = require('../../models/batchModel')
const prom = require('../../lib/prom')
const Formatter = require('../../formatters/admin/batchFormatter')
const helper = require('../../lib/helper')
const linkProcess = require('../../process/linkProcess')
const config = require('../../config')
const rules = require('../../lib/rules')
const validate = require('express-validation')
const Joi = require('joi')
const mongoose = require('mongoose')

function load (app) {
  module.exports.formatter = new Formatter()
  app.get('/admin/batches', app.oauth.authenticate(), helper.userOnReq, helper.ensureAdmin, validate({
    query: {
      id: Joi.alternatives().try(Joi.array().items(rules.objId), rules.objId),
      offset: Joi.number().min(0),
      limit: Joi.number().min(1).max(config.pagination_limit)
    }
  }), prom(async function (req, res) {
    const offset = parseInt(req.query.offset || 0)
    const limit = req.query.limit || config.pagination_limit
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

  app.post('/admin/batches', app.oauth.authenticate(), helper.userOnReq, helper.ensureAdmin, validate({
    body: {
      link: Joi.string().required()
    }
  }), prom(async function (req, res) {
    const batch = await new Promise((resolve, reject) => {
      const ev = linkProcess.run(req.body.link)
      ev.on('batchstarted', resolve)
    })
    return module.exports.formatter.format(batch)
  }))
}

module.exports = {
  load: load
}
