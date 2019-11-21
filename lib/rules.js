const Joi = require('joi')

exports = module.exports
exports.mangaName = Joi.string().min(3).max(70).required()
exports.chapterNum = Joi.number().min(-1).required()
