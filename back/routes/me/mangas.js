import { validate, Joi } from 'express-validation'
import mongoose from 'mongoose'
import MangaModel from '../../models/mangaModel.js'
import ChapterModel from '../../models/chapterModel.js'
import prom from '../../lib/prom.js'
import * as rules from '../../lib/rules.js'
import errorHandler from '../../lib/errorHandler.js'
import helper from '../../lib/helper.js'
import formatter from '../../formatters/me/mangaFormatter.js'

function load (app) {
  app.put('/me/mangas/:mangaId', helper.authenticate, validate({
    params: Joi.object({
      mangaId: rules.objId
    }),
    body: Joi.object({
      num: rules.chapterNum
    })
  }), prom(async function (req, res) {
    const mangaId = req.params.mangaId
    const num = req.body.num
    const m = await MangaModel.findChapter({ _id: mangaId, num }, '*')
    if (!m) {
      return errorHandler.notFound('Manga')
    }
    return req.user.saveManga({ mangaId, num, updatedAt: Date.now() }).then(formatter.format)
  }))
  app.delete('/me/mangas/:mangaId', helper.authenticate, validate({
    params: Joi.object({
      mangaId: rules.objId
    })
  }), prom(function (req, res) {
    const mangaId = req.params.mangaId
    return req.user.removeManga({ mangaId, updatedAt: Date.now() }).then(formatter.format)
  }))
  app.patch('/me/mangas', helper.authenticate, validate({
    body: Joi.object({
      items: Joi.array().min(1).items(Joi.object({
        mangaId: rules.objId,
        num: rules.chapterNum,
        updatedAt: rules.timestamp
      })).required()
    })
  }), prom(async function (req, res) {
    const items = req.body.items
    { // check manga existence
      const matchedIds = await ChapterModel.find({
        mangaId: {
          $in: items.map(x => mongoose.Types.ObjectId(x.mangaId))
        }
      }).select('mangaId').lean()
      const foundMangaIds = new Set(matchedIds.map(x => x.mangaId.toString()))
      if (foundMangaIds.size !== items.length) {
        const invalids = items
          .map(({ mangaId }) => mangaId)
          .filter(mangaId => !foundMangaIds.has(mangaId))
        return errorHandler.unknownMangas(invalids)
      }
    }
    { // check chapter existence
      const ids = items.map(({ mangaId, num }) => {
        return {
          mangaId: mongoose.Types.ObjectId(mangaId),
          chapters: {
            $elemMatch: {
              num
            }
          }
        }
      })
      const matchedChapters = await ChapterModel.aggregate([
        {
          $match: {
            $or: ids
          }
        },
        {
          $group: {
            _id: '$mangaId'
          }
        }
      ])
      const foundMangaIds = new Set(matchedChapters.map(x => x._id.toString()))
      const invalids = items
        .map(({ mangaId, num }) => ({ mangaId, num }))
        .filter(({ mangaId }) => !foundMangaIds.has(mangaId))
      if (invalids.length) {
        return errorHandler.unknownChapters(JSON.stringify(invalids))
      }
    }
    return req.user.updateMangas(items).then(formatter.formatCollection)
  }))

  app.get('/me/mangas', validate({
    query: Joi.object({
      populated: Joi.boolean()
    })
  }), helper.authenticateLean, prom(async (req, res) => {
    const userMap = req.user.mangas
    const mangaMap = req.query.populated
      ? await MangaModel
          .find({ _id: { $in: [...Object.keys(userMap)].map(k => mongoose.Types.ObjectId(k)) } })
          .lean()
          .then(mangas => new Map(mangas.map(m => [m._id.toString(), m])))
      : new Map()

    const map = new Map(Object.entries(userMap).map(([id, myManga]) => {
      return [id, { ...myManga, manga: mangaMap.get(id) }]
    }))
    return formatter.formatCollection(map, { populated: req.query.populated })
  }))
}
export { load }
export default {
  load: load
}
