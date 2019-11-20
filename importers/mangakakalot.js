const Base = require('./base')
var moment = require('moment')
var config = require('../config')

class Importer extends Base {
  constructor () {
    super()
    this.allUrl = 'https://mangakakalot.com'
  }
}

Importer.prototype.parseDate = function (s, now) {
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

/**
 * fetch all the new updates. Return a payload as
 * {
 *   name:{
 *     last:xx
 *     url:uri
 *   }
 * }
 * @return {[type]} [description]
 */
Importer.prototype.allUpdates = function () {
  return this.domFetch(this.allUrl).then($ => {
    return $('.itemupdate').map((i, x) => {
      const $x = $(x)
      const title = $x.find('h3 a').text()
      const li = $x.find('li:nth-child(2)').eq(0)
      const url = li.find('a').attr('href')
      const last = li.find('i').text()
      const num = parseFloat(li.find('a').attr('href').match(/_([^_]+)$/)[1])
      const thumbUrl = $x.find('img').attr('src')
      return { title, last, url, num, thumbUrl }
    }).toArray()
  }).then(arr => {
    return arr.reduce((acc, { title, last, url, num, thumbUrl }) => {
      if (!title || !last || !url) {
        config.logger.dbg('failed to parse', title, last, url)
      }
      last = this.parseDate(last)
      if (!acc[title]) {
        acc[title] = { last, url, num, name: title, thumbUrl }
      }
      return acc
    }, {})
  })
}

Importer.prototype.parseDateDetail = function (s, now) {
  if (!s.includes('ago')) {
    return new Date(s).getTime()
  }
  return this.parseDate(s, now)
}
/**
 * url maps to a chapter view. e.g
 * https://mangakakalot.com/chapter/to_you_the_immortal/chapter_110
 *
 * return all the chaps for given manga
 * [
 *     {
 *         name:'xx',
 *         num:xx
 *         url
 *     }
 * ]
 * @return {[type]} [description]
 */
Importer.prototype.fetchMangaDetail = function (chap) {
  const uri = chap.url.split('/')
  uri.pop()// chapter
  const url = uri.join('/').replace('chapter', 'manga')
  config.logger.dbg('fetching', url)
  return this.domFetch(url).then($ => {
    return $('.chapter-list .row').map((i, x) => {
      const a = $(x).find('a')
      const name = a.attr('title')
      const url = a.attr('href')
      const num = parseFloat(url.match(/_([^_]+)$/)[1])
      let at = $(x).find('span[title]').eq(0).attr('title')
      at = this.parseDateDetail(at)
      return { name, url, num, at }
    }).toArray()
  })
}
module.exports = Importer
