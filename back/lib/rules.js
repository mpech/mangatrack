const Joi = require('joi')
const config = require('../config')

module.exports.nameId = Joi.string().min(3).max(config.nameId_maxLength).required()
module.exports.chapterNum = Joi.number().min(0).required()
module.exports.objId = Joi.string().min(24).max(24).required()
module.exports.timestamp = Joi.number().min(0).required()
