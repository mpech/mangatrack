const { validate, Joi } = require('express-validation')
const mongoose = require('mongoose')
const MangaModel = require('../../models/mangaModel')
const ChapterModel = require('../../models/chapterModel')
const prom = require('../../lib/prom')
const rules = require('../../lib/rules')
const errorHandler = require('../../lib/errorHandler')
const helper = require('../../lib/helper')
const formatter = require('../../formatters/me/mangaFormatter')

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
    return req.user.removeManga({ mangaId, updatedAt: Date.now() }).then(formatter.format).catch(e => console.log('e : ', e))
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
  }), helper.authenticate, prom(async (req, res) => {
    let map = req.user.mangas
    if (req.query.populated) {
      map = await MangaModel
        .find({ _id: { $in: [...map.keys()].map(k => mongoose.Types.ObjectId(k)) } })
        .lean()
        .then(mangas => {
          const mangaMap = new Map(mangas.map(m => [m._id.toString(), m]))
          return new Map([...map.entries()].map(([id, myManga]) => {
            return [id, { ...myManga.toJSON(), manga: mangaMap.get(id) }]
          }))
        })
    }
    return formatter.formatCollection(map, { populated: req.query.populated })
  }))
}

module.exports = {
  load: load
}
