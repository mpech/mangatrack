const validate = require('express-validation')
const mongoose = require('mongoose')
const Joi = require('joi')
const MangaModel = require('../../models/mangaModel')
const ChapterModel = require('../../models/chapterModel')
const prom = require('../../lib/prom')
const rules = require('../../lib/rules')
const errorHandler = require('../../lib/errorHandler')
const helper = require('../../lib/helper')
const formatter = require('../../formatters/me/mangaFormatter')

function load (app) {
  app.put('/me/mangas/:mangaId', app.oauth.authenticate(), validate({
    params: {
      mangaId: rules.objId
    },
    body: {
      num: rules.chapterNum
    }
  }), helper.userOnReq, prom(async function (req, res) {
    const mangaId = req.params.mangaId
    const num = req.body.num
    const m = await MangaModel.findChapter({ _id: mangaId, num }, '*')
    if (!m) {
      return errorHandler.notFound('Manga')
    }
    return req.user.saveManga({ mangaId, num, updatedAt: Date.now() }).then(formatter.format)
  }))

  app.delete('/me/mangas/:mangaId', app.oauth.authenticate(), validate({
    params: {
      mangaId: rules.objId
    }
  }), helper.userOnReq, prom(function (req, res) {
    const mangaId = req.params.mangaId
    return req.user.removeManga({ mangaId, updatedAt: Date.now() }).then(formatter.format).catch(e => console.log('e : ', e))
  }))

  app.patch('/me/mangas', app.oauth.authenticate(), validate({
    body: {
      items: Joi.array().min(1).items(Joi.object({
        mangaId: rules.objId,
        num: rules.chapterNum,
        updatedAt: rules.timestamp
      })).required()
    }
  }), helper.userOnReq, prom(async function (req, res) {
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

  app.get('/me/mangas', app.oauth.authenticate(), helper.userOnReq, prom(async (req, res) => {
    return formatter.formatCollection(req.user.mangas)
  }))
}

module.exports = {
  load: load
}
