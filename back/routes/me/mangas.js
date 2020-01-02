const validate = require('express-validation')
const mongoose = require('mongoose')
const Joi = require('joi')
const UserModel = require('../../models/userModel')
const MangaModel = require('../../models/mangaModel')
const ChapterModel = require('../../models/chapterModel')
const prom = require('../../lib/prom')
const rules = require('../../lib/rules')
const errorHandler = require('../../lib/errorHandler')
const Formatter = require('../../formatters/me/mangaFormatter')

function load (app) {
  module.exports.formatter = new Formatter()
  const helper = {
    userOnReq: function (req, res, next) {
      return UserModel.findOneForSure({ _id: res.locals.oauth.token.user.id }).then(user => {
        req.user = user
      }).then(_ => next(null)).catch(next)
    }
  }

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
    const manga = await req.user.saveManga({ mangaId, num })
    return module.exports.formatter.format(manga)
  }))

  app.delete('/me/mangas/:mangaId', app.oauth.authenticate(), validate({
    params: {
      mangaId: rules.objId
    }
  }), helper.userOnReq, prom(function (req, res) {
    const mangaId = req.params.mangaId
    return req.user.removeManga({ mangaId }).then(m => ({}))
  }))

  app.patch('/me/mangas', app.oauth.authenticate(), validate({
    body: {
      items: Joi.array().min(1).items(Joi.object({
        mangaId: rules.objId,
        num: rules.chapterNum
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
        const notFound = items.reduce((acc, { mangaId }) => {
          if (!foundMangaIds.has(mangaId)) {
            acc.push(mangaId)
          }
          return acc
        }, [])
        return errorHandler.unknownMangas(notFound)
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
      const invalids = items.reduce((acc, { mangaId, num }) => {
        if (!foundMangaIds.has(mangaId)) {
          acc.push({ mangaId, num })
        }
        return acc
      }, [])

      if (invalids.length) {
        return errorHandler.unknownChapters(JSON.stringify(invalids))
      }
    }

    return req.user.updateMangas(items).then(mangas => ({}))
  }))

  app.get('/me/mangas', app.oauth.authenticate(), helper.userOnReq, prom(async (req, res) => {
    const items = [...req.user.mangas.entries()].map(([mangaId, num]) => ({ mangaId, num }))
    return { items }
  }))
}

module.exports = {
  load: load
}
