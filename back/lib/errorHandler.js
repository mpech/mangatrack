const config = require('../config')
const express = function (err, req, res, next) {
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

module.exports = {
  express: _ => express,
  MangaTrackError,
  notFound: errFunc(1, 404, 'not found (#0)'),
  unknownMangas: errFunc(2, 400, 'unknown mangas(#0)'),
  unknownChapters: errFunc(3, 400, 'unknown chapters(#0)'),
  internalInvalidParams: errFunc(4, 500, 'expects: #0 got #1'),
  noEmptyManga: errFunc(5, 500, 'expect at least one chapter for #0'),
  importerRequiresInteraction: errFunc(6, 500, 'requires browser interaction for #0')
}
