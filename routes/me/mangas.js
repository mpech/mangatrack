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
    const manga = {
      nameId: req.params.nameId,
      num: req.body.num
    }
    const m = await MangaModel.findOneForSure({ nameId: manga.nameId })
    return req.user.saveManga(manga)
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
    const ids = new Set(req.body.items.map(x => x.nameId))
    const items = await MangaModel.find({ nameId: { $in: [...ids] } })
      .select('nameId')
      .lean()
    if (items.length !== ids.size) {
      const found = new Set(items.map(x => x.nameId))
      const notFound = [...ids].reduce((acc, id) => {
        if (!found.has(id)) {
          acc.push(id)
        }
        return acc
      }, [])
      return errorHandler.unknownMangas(notFound)
    }
    return req.user.saveMangas(req.body.items).then(mangas => ({}))
  }))

  app.get('/me/mangas', app.oauth.authenticate(), helper.userOnReq, prom(function (req, res) {
    const items = [...req.user.mangas.entries()].map(([nameId, num]) => ({ nameId, num }))
    return Promise.resolve({ items })
  }))
}

module.exports = {
  load: load
}
