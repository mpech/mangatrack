import { validate, Joi } from 'express-validation'
import mongoose from 'mongoose'
import MangaModel from '../models/mangaModel.js'
import config from '../config/index.js'
import Formatter from '../formatters/mangaFormatter.js'
import prom from '../lib/prom.js'
import * as rules from '../lib/rules.js'
import errorHandler from '../lib/errorHandler.js'

const formatter = new Formatter()
export const load = function (app) {
  app.get('/mangas', validate({
    query: Joi.object({
      q: Joi.string().min(3),
      minChapters: Joi.number().min(0),
      id: Joi.alternatives().try(Joi.array().items(rules.objId), rules.objId),
      offset: Joi.number().min(0),
      limit: Joi.number().min(1).max(config.pagination_limit),
      tags: Joi.alternatives().try(Joi.array().items(rules.tagEnum), rules.tagEnum, Joi.string().valid('untagged'))
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
    if (req.query.q) {
      crit.name = new RegExp(req.query.q, 'i')
    }
    if (req.query.minChapters) {
      crit.lastChap_num = { $gte: parseInt(req.query.minChapters, 10) }
    }
    if (req.query.tags) {
      crit.tags = Array.isArray(req.query.tags)
        ? { $in: req.query.tags }
        : req.query.tags === 'untagged'
          ? { $size: 0 }
          : req.query.tags
    }
    const [count, coll] = await Promise.all([
      MangaModel.countDocuments(crit),
      MangaModel.find(crit).sort({ lastChap_at: -1 }).skip(offset).limit(limit).lean()
    ])

    return formatter.formatCollection(coll, { count, offset, limit })
  }))
  app.get('/mangas/:nameId', validate({
    params: Joi.object({
      nameId: rules.nameId
    })
  }), prom(async function (req, res) {
    const pred = req.params.nameId.match(/^[0-9a-f]{24}$/)
      ? ({ _id: mongoose.Types.ObjectId(req.params.nameId) })
      : ({ nameId: req.params.nameId })
    const mangas = await MangaModel.aggregate([
      { $match: pred },
      { $limit: 1 },
      {
        $lookup: {
          from: 'chapters',
          localField: '_id',
          foreignField: 'mangaId',
          as: 'chapters'
        }
      }
    ])
    return mangas.length
      ? formatter.formatFull(mangas[0])
      : errorHandler.notFound('Manga (' + req.params.nameId + ')')
  }))
}
export default { load }
