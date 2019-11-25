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
  constructor ({ code, str }) {
    super(str)
    this.status = code

    // express
    this.reason = str
  }
}

function error (code, iStr, ...args) {
  const str = args.reduce((s, arg, i) => s.replace(`#${i}`, arg), iStr)
  return new MangaTrackError({ code, str })
}

function errFunc (code, str) {
  return function () {
    throw error(code, str, ...arguments)
  }
}

module.exports = {
  express: _ => express,
  notFound: errFunc(404, 'not found (#0)'),
  unknownMangas: errFunc(400, 'unknown mangas(#0)'),
  unknownChapters: errFunc(400, 'unknown chapters(#0)')
}
