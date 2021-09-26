import config from '../config/index.js'
import { ValidationError } from 'express-validation'
const express = function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err)
  }
  if (res.headersSent) {
    return next(err)
  }
  if (err.status) {
    try {
      return res.status(err.status).json(err)
    } catch (e) {
      return res.status(err.status).send(err)
    }
  }
  config.logger.dbg('err', err)
  return res.status(500).send('Something broke')
}
class MangaTrackError extends Error {
  constructor ({ code, id, str }) {
    super(str)
    this.status = code
    this.id = id
    // express
    this.reason = str
  }
}
function error (code, id, iStr, ...args) {
  const str = args.reduce((s, arg, i) => s.replace(`#${i}`, arg), iStr)
  throw new MangaTrackError({ code, id, str })
}
const errFunc = (id, code, str) => {
  const f = function () { return error(code, id, str, ...arguments) }
  f.id = id
  return f
}
export const notFound = errFunc(1, 404, 'not found (#0)')
export const unknownMangas = errFunc(2, 400, 'unknown mangas(#0)')
export const unknownChapters = errFunc(3, 400, 'unknown chapters(#0)')
export const internalInvalidParams = errFunc(4, 500, 'expects: #0 got #1')
export const noEmptyManga = errFunc(5, 500, 'expect at least one chapter for #0')
export const importerRequiresInteraction = errFunc(6, 500, 'requires browser interaction for #0')
export const noImporterFound = errFunc(7, 500, 'no importer found for #0')
export const invalidGrants = errFunc(8, 401, 'invalid grants')
export const tooManyRedirect = errFunc(9, 500, 'too many redirect')
export const invalidTokenError = errFunc(10, 400, 'invalid token error')
export { MangaTrackError }
export default {
  express: _ => express,
  MangaTrackError,
  notFound,
  unknownMangas,
  unknownChapters,
  internalInvalidParams,
  noEmptyManga,
  importerRequiresInteraction,
  noImporterFound,
  invalidGrants,
  tooManyRedirect,
  invalidTokenError
}
