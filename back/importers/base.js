import axios from 'axios'
import cheerio from 'cheerio'
class Base {
}
Base.prototype.domFetch = async function (url) {
  const { data } = await axios.get(url)
  const $ = cheerio.load(data, {
    xml: false,
    decodeEntities: false
  })
  return $
}
const monthes = 'jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec'.split('|')
const rmonth = '(?<month>\\d{1,2})'
const rlitmonth = '(?<litmonth>' + monthes.join('|') + ')'
const ryear = '(?<year>\\d{4})'
const rday = '(?<day>\\d{1,2})'
const rhour = '(?<hour>\\d{1,2})'
const rminute = '(?<minute>\\d{1,2})'
const rsep = '[^\\w]*'
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
      return now - num * 3600 * 24 * 1000
    } else if (s.includes('hour')) {
      return now - num * 3600 * 1000
    } else {
      return now - num * 60 * 1000
    }
  }
  if (s.includes('esterday')) {
    return now - 1 * 3600 * 24 * 1000
  }
  if (s.includes('oday')) {
    // minus one hour
    return now - 1 * 3600 * 1000
  }
  if (new RegExp([rlitmonth, rday, ryear].join(rsep), 'i').test(s)) {
    const { litmonth, day, year } = s.match(new RegExp([rlitmonth, rday, ryear].join(rsep), 'i')).groups
    return new Date(year, monthes.indexOf(litmonth.toLowerCase()), day).getTime()
  }
  if (new RegExp([rmonth, rday, rhour, rminute].join(rsep), 'i').test(s)) {
    const { month, day, hour, minute } = s.match(new RegExp([rmonth, rday, rhour, rminute].join(rsep), 'i')).groups

    return new Date(new Date().getFullYear(), month - 1, day, hour, minute).getTime()
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
export default Base
