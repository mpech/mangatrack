import Joi from 'joi'
import config from '../config/index.js'
export const nameId = Joi.string().min(3).max(config.nameId_maxLength).required()
export const chapterNum = Joi.number().min(0).required()
export const objId = Joi.string().min(24).max(24).required()
export const timestamp = Joi.number().min(0).required()
