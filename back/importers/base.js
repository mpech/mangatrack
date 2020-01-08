const rp = require('request-promise-native')
const moment = require('moment')
const cheerio = require('cheerio')
class Base {}

Base.prototype.domFetch = async function (url) {
  const body = await rp(url)
  const $ = cheerio.load(body, {
    xml: {
      normalizeWhitespace: true
    },
    decodeEntities: false
  })
  return $
}

Base.prototype.parseDate = function (s, now) {
  now = now || Date.now()
  /*
  attempt to reverse any date
  check for human stuff:
    ago,
    yesterday, today,
    last week/month/year
  check for halt numeric stuff
    Nov xx DELIM 2019
  check for numeric stuff
    11/05 hh-md
  default for gmt stuff
    2019-12-04T08:54:15
   */
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
  if (s.includes('esterday')) {
    return moment(now - 1 * 3600 * 24 * 1000).valueOf()
  }
  if (s.includes('oday')) {
    // minus one hour
    return moment(now - 1 * 3600 * 1000).valueOf()
  }
  if (s.match(/sep|oct|nov|dec|jan|feb|mar|apr|may|jun|jul|aug/i)) {
    return moment(s, 'MMM-DD,YYYY').valueOf()
  }
  if (moment(s, 'MM-DD HH:mm').isValid()) {
    return moment(s, 'MM-DD HH:mm').valueOf()
  }
  return new Date(s).getTime()
}

Base.prototype.parseDateDetail = function (s, now) {
  return this.parseDate(s, now)
}

Base.prototype.ensureAbsoluteUrl = function (url) {
  url = url.trim()
  if (url.startsWith('/')) {
    url = new URL(url, this.allUrl).href
  }
  return url
}

Base.prototype.accepts = function (link) {
  const url = new URL(this.allUrl)
  return link.startsWith(url.origin)
}

Base.prototype.isLinkValid = function (link) {
  const url = new URL(this.allUrl)
  const r = new RegExp('^' + url.origin + '/manga/[^/]+/?$', 'i')
  return r.test(link)
}

module.exports = Base
