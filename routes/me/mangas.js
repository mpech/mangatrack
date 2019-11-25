const validate = require('express-validation')
const Joi = require('joi')
const UserModel = require('../../models/userModel')
const MangaModel = require('../../models/mangaModel')
const prom = require('../../lib/prom')
const rules = require('../../lib/rules')
const errorHandler = require('../../lib/errorHandler')

function load (app) {
  const helper = {
    userOnReq: function (req, res, next) {
      return UserModel.findOneForSure({ _id: res.locals.oauth.token.user.id }).then(user => {
        req.user = user
      }).then(_ => next(null)).catch(next)
    }
  }

  app.put('/me/mangas/:nameId', app.oauth.authenticate(), validate({
    params: {
      nameId: rules.mangaName
    },
    body: {
      num: rules.chapterNum
    }
  }), helper.userOnReq, prom(async function (req, res) {
    const nameId = req.params.nameId
    const num = req.body.num
    await MangaModel.findOneForSure({ nameId, chapters: { $elemMatch: { num } } })
    return req.user.saveManga({ nameId, num })
  }))

  app.delete('/me/mangas/:nameId', app.oauth.authenticate(), validate({
    params: {
      nameId: rules.mangaName
    }
  }), helper.userOnReq, prom(function (req, res) {
    return req.user.removeManga({ nameId: req.params.nameId }).then(m => ({}))
  }))

  app.patch('/me/mangas', app.oauth.authenticate(), validate({
    body: {
      items: Joi.array().items(Joi.object({
        nameId: rules.mangaName,
        num: rules.chapterNum
      })).required()
    }
  }), helper.userOnReq, prom(async function (req, res) {
    const items = req.body.items
    const matchedItems = await MangaModel.find({ nameId: { $in: [...items.map(x => x.nameId)] } })
      .select('nameId chapters.num')
      .lean()

    const nameIdToManga = matchedItems.reduce((m, { nameId, chapters }) => {
      m.set(nameId, chapters)
      return m
    }, new Map())

    if (nameIdToManga.size !== items.length) {
      const notFound = items.reduce((acc, { nameId }) => {
        if (!nameIdToManga.has(nameId)) {
          acc.push(nameId)
        }
        return acc
      }, [])
      return errorHandler.unknownMangas(notFound)
    }

    const invalids = items.reduce((acc, { nameId, num }) => {
      const s = new Set(nameIdToManga.get(nameId).map(c => c.num))
      if (!s.has(num)) {
        acc.push({ nameId, num })
      }
      return acc
    }, [])

    if (invalids.length) {
      return errorHandler.unknownChapters(JSON.stringify(invalids))
    }
    return req.user.saveMangas(items).then(mangas => ({}))
  }))

  app.get('/me/mangas', app.oauth.authenticate(), helper.userOnReq, prom(function (req, res) {
    const items = [...req.user.mangas.entries()].map(([nameId, num]) => ({ nameId, num }))
    return Promise.resolve({ items })
  }))
}

module.exports = {
  load: load
}
