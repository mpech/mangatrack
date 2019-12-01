const validate = require('express-validation')
const mongoose = require('mongoose')
const Joi = require('joi')
const UserModel = require('../../models/userModel')
const MangaModel = require('../../models/mangaModel')
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
    await MangaModel.findOneForSure({ _id: mangaId, chapters: { $elemMatch: { num } } })
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
      items: Joi.array().items(Joi.object({
        mangaId: rules.objId,
        num: rules.chapterNum
      })).required()
    }
  }), helper.userOnReq, prom(async function (req, res) {
    const items = req.body.items
    const matchedItems = await MangaModel.find({ _id: { $in: [...items.map(x => mongoose.Types.ObjectId(x.mangaId))] } })
      .select('_id chapters.num')
      .lean()

    const idToManga = matchedItems.reduce((m, { _id, chapters }) => {
      m.set(_id.toString(), chapters)
      return m
    }, new Map())

    if (idToManga.size !== items.length) {
      const notFound = items.reduce((acc, { mangaId }) => {
        if (!idToManga.has(mangaId)) {
          acc.push(mangaId)
        }
        return acc
      }, [])
      return errorHandler.unknownMangas(notFound)
    }

    const invalids = items.reduce((acc, { mangaId, num }) => {
      const s = new Set(idToManga.get(mangaId).map(c => c.num))
      if (!s.has(num)) {
        acc.push({ mangaId, num })
      }
      return acc
    }, [])

    if (invalids.length) {
      return errorHandler.unknownChapters(JSON.stringify(invalids))
    }
    return req.user.saveMangas(items).then(mangas => ({}))
  }))

  app.get('/me/mangas', app.oauth.authenticate(), helper.userOnReq, prom(async (req, res) => {
    const items = [...req.user.mangas.entries()].map(([mangaId, num]) => ({ mangaId, num }))
    return { items }
  }))
}

module.exports = {
  load: load
}
