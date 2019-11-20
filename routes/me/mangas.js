const validate = require('express-validation')
const Joi = require('joi')
const UserModel = require('../../models/userModel')
const prom = require('../../lib/prom')

function load (app) {
  const helper = {
    userOnReq: function(req, res, next) {
      return UserModel.findById(res.locals.oauth.token.user.id).then(user => {
        req.user = user
      }).then(_=>next(null)).catch(next)
    }
  }

  app.put('/me/mangas/:nameId', app.oauth.authenticate(), validate({
    params: {
      nameId: Joi.string().min(3)
    },
    body: {
      num: Joi.number().min(-1).required()
    }
  }), helper.userOnReq, prom(function (req, res) {
    const manga = {
      nameId: req.params.nameId,
      num: req.body.num
    }
    return req.user.saveManga(manga)
  }))

  app.delete('/me/mangas/:nameId', app.oauth.authenticate(), validate({
    params: {
      nameId: Joi.string().min(3)
    }
  }), helper.userOnReq, prom(function (req, res) {
    return req.user.removeManga({ nameId: req.params.nameId }).then(m => {
      return {}
    })
  }))

  app.patch('/me/mangas', app.oauth.authenticate(), validate({
    body: {
      items: Joi.array(Joi.sub({})).required()
    }
  }), helper.userOnReq, prom(function (req, res) {
    return req.user.mergeMangas(req.body.items).then(mangas => {
      return {}
    })
  }))
}

module.exports = {
  load: load
}
