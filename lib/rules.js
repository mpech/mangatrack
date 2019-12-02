const Joi = require('joi')
const config = require('../config')

exports = module.exports
exports.nameId = Joi.string().min(3).max(config.nameId_maxLength).required()
exports.chapterNum = Joi.number().min(0).required()
exports.objId = Joi.string().min(24).max(24).required()
