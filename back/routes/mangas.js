const validate = require('express-validation')
const mongoose = require('mongoose')
const Joi = require('joi')
const MangaModel = require('../models/mangaModel')
const ChapterModel = require('../models/chapterModel')
const config = require('../config')
const Formatter = require('../formatters/mangaFormatter')
const prom = require('../lib/prom')
const rules = require('../lib/rules')

function load (app) {
  this.formatter = new Formatter()
  // tags is not really meant to be supported. sites do it better
  // Just offer the filtering of manhwa...
  //
  // allow to filter by name to follow a specific manga though
  // there is a shitload of filter: type, offset, name, no sort: just timestamp desc
  app.get('/mangas', validate({
    query: {
      q: Joi.string().min(3),
      minChapters: Joi.number().min(0),
      id: Joi.alternatives().try(Joi.array().items(rules.objId), rules.objId),
      type: Joi.string().valid(...MangaModel.schema.tree.type.enum),
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

    if (req.query.q) {
      crit.name = new RegExp(req.query.q, 'i')
    }

    if (req.query.minChapters) {
      crit.lastChap_num = { $gte: parseInt(req.query.minChapters, 10) }
    }

    if (req.query.type) { crit.type = req.query.type }

    const [count, coll] = await Promise.all([
      MangaModel.countDocuments(crit),
      MangaModel.find(crit).sort({ lastChap_at: -1 }).skip(offset).limit(limit).lean().exec()
    ])
    return module.exports.formatter.formatCollection(coll, { count, offset, limit })
  }))

  app.get('/mangas/:nameId', validate({
    params: {
      nameId: rules.nameId
    }
  }), prom(async function (req, res) {
    const pred = req.params.nameId.match(/^[0-9a-f]{24}$/)
      ? ({ _id: mongoose.Types.ObjectId(req.params.nameId) })
      : ({ nameId: req.params.nameId })
    const m = await MangaModel.findOneForSure(pred)
    const chapters = await ChapterModel.find({ mangaId: m._id })
    m.chapters = chapters
    return module.exports.formatter.formatFull(m)
  }))
}

module.exports = {
  load: load
}
