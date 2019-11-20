const validate = require('express-validation')
const Joi = require('joi')
const MangaModel = require('../models/mangaModel')
const config = require('../config')
const Formatter = require('../formatters/mangaFormatter')
const ChapterFormatter = require('../formatters/chapterFormatter')
const prom = require('../lib/prom')

function load (app) {
  this.formatter = new Formatter()
  this.chapterFormatter = new ChapterFormatter()

  // tags is not really meant to be supported. sites do it better
  // Just offer the filtering of manhwa...
  //
  // allow to filter by name to follow a specific manga though
  // there is a shitload of filter: type, offset, name, no sort: just timestamp desc
  app.get('/mangas', validate({
    query: {
      name: Joi.string().min(3).max(100),
      type: Joi.string().valid(...MangaModel.schema.tree.type.enum),
      offset: Joi.number().min(0),
      limit: Joi.number().min(1).max(config.pagination_limit)
    }
  }), prom(function (req, res) {
    const offset = parseInt(req.query.offset || 0)
    const limit = req.query.limit || config.pagination_limit
    const crit = {}
    if (req.query.name) { crit.name = new RegExp(req.query.name, 'i') }
    if (req.query.type) { crit.type = req.query.type }

    return Promise.all([
      MangaModel.countDocuments(crit),
      MangaModel.find(crit).sort({ updatedAt: -1 }).skip(offset).limit(limit).lean().exec()
    ]).then(([count, coll]) => {
      return module.exports.formatter.formatCollection(coll, { count, offset, limit })
    })
  }))

  app.get('/mangas/:nameId/chapters', validate({
    params: {
      nameId: Joi.string().min(3)
    }
  }), prom(function (req, res) {
    return MangaModel.findOne({ nameId: req.params.nameId }).then(m => {
      return module.exports.chapterFormatter.formatCollection(m.chapters)
    })
  }))
}

module.exports = {
  load: load
}
