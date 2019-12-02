var rp = require('request-promise-native')
var moment = require('moment')
var cheerio = require('cheerio')
class Base {}

Base.prototype.domFetch = async function (url) {
  const body = await rp(url)
  const $ = cheerio.load(body, {
    xml: {
      normalizeWhitespace: true
    }
  })
  return $
}

Base.prototype.parseDate = function (s, now) {
  now = now || Date.now()
  if (s.includes('ago')) {
    s = s.replace('ago', '')
    const num = parseInt(s.match(/\d+/))
    if (s.includes('day')) {
      return moment(now - num * 3600 * 24 * 1000).valueOf()
    } else if (s.includes('hour')) {
      return moment(now - num * 3600 * 1000).valueOf()
    } else {
      return moment(now - num * 60 * 1000).valueOf()
    }
  }
  return (moment(s, 'MM-DD HH:mm')).valueOf()
}

Base.prototype.parseDateDetail = function (s, now) {
  if (!s.includes('ago')) {
    return new Date(s).getTime()
  }
  return this.parseDate(s, now)
}

module.exports = Base
