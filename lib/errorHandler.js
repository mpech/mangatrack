var config = require('../config')
var express = function (err, req, res, next) {
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

const errFunc400 = (id, str) => function () { error(400, id, str, ...arguments) }
const errFunc404 = (id, str) => function () { error(404, id, str, ...arguments) }
const errFunc500 = (id, str) => function () { error(500, id, str, ...arguments) }

module.exports = {
  express: _ => express,
  notFound: errFunc404(1, 'not found (#0)'),
  unknownMangas: errFunc400(2, 'unknown mangas(#0)'),
  unknownChapters: errFunc400(3, 'unknown chapters(#0)'),
  internalInvalidParams: errFunc500(4, 'expects: #0 got #1'),
  noEmptyManga: errFunc500(5, 'expect at least one chapter for #0')
}
