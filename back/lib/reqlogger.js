// copy pasted from morgan
function getip (req) {
  return req.ip ||
    req._remoteAddress ||
    (req.connection && req.connection.remoteAddress) ||
    undefined
}
function escapeBody (body) {
  if (typeof (body) === 'string') {
    try {
      body = JSON.parse(body)
    } catch (e) {
      body = {}
    }
  }
  const bodyLog = Object.keys(body).reduce(function (acc, x) {
    acc[x] = body[x]
    return acc
  }, {}) || {};
  ['password', 'old_password', 'oldPassword'].forEach(function (x) {
    if (x in body) {
      bodyLog[x] = '__hidden'
    }
  })
  return bodyLog
}

function escapeQuery (url) {
  return url.replace(/code=[^&]+/, 'code=__hidden')
}

module.exports = {
  express: function (config) {
    const onStart = function (req, res, next) {
      let osHeader = 'os_unknown'
      if (req.headers && req.headers.os) {
        osHeader = req.headers.os.substring(0, 20).replace(/ /g, '_')// #issue/4012
      }
      req._bodyLog = escapeBody(req.body || {})
      req._urlLog = escapeQuery(req.url)
      config.logger.inf('REQUEST', req.method, osHeader, req._urlLog, JSON.stringify(req._bodyLog), getip(req))
      req.startedTime = Date.now()
      next()
    }

    // we could use domain to identifiate user, but a too much coupling
    const onAuthUser = function (req, res) {
      config.logger.inf('REQAUTH', req.method, req._urlLog, JSON.stringify(req._bodyLog), getip(req))
    }

    return function (req, res, next) {
      req.onAuthUser = onAuthUser.bind(null, req, res)
      onStart(req, res, next)
      res._monkeyPatchSend = res.send
      res.send = function () {
        const elapsed = Date.now() - req.startedTime
        if (config.maxRequestTime && elapsed > config.maxRequestTime) {
          config.logger.sta('BIGREQ', elapsed, 'ms', req.method, req._urlLog, JSON.stringify(req._bodyLog), getip(req))
        }

        config.logger.sta('REQURL', req.method, req._urlLog, elapsed, 'ms')
        config.logger.dbg('RESPONSE', arguments[0])
        if (this.statusCode < 200 || this.statusCode > 299) {
          config.logger.sta('RESERR', arguments[0])
        }
        res._monkeyPatchSend.apply(res, arguments)
      }
    }
  }
}
