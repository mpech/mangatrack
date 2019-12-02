const Base = require('./base')
var moment = require('moment')
var config = require('../config')

class Importer extends Base {
  constructor () {
    super()
    this.allUrl = 'http://fanfox.net/releases/'
  }
}

/**
 * fetch all the new updates. Return a payload as
 * {
 *   name:{
 *     title: same as name
 *     last: datestring of last chapter
 *     url: link to last chapter
 *     num: num of last chapter
 *     thumbUrl: xx
 *   }
 * }
 */
Importer.prototype.allUpdates = async function () {
  const $ = await this.domFetch(this.allUrl)
  const arr = $('.manga-list-4-list > li').map((i, x) => {
    const $x = $(x)
    const title = $x.find('.manga-list-4-item-title a').attr('title')
    const last = $x.find('.manga-list-4-item-subtitle span').text()
    const a = $x.find('.manga-list-4-item-part a')
    const url = a.attr('href')
    const num = parseFloat(url.match(/c[0-9.]+/)[0].substring(1))

    let thumbUrl = $x.find('img').attr('src')
    if (thumbUrl.includes('?')) {
      thumbUrl = thumbUrl.substring(0, thumbUrl.indexOf('?'))
    }
    return { title, last, url, num, thumbUrl }
  }).toArray()

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
}

/**
 * url maps to a chapter view. e.g
 * http://fanfox.net/manga/onepunch_man/vTBD/c122/1.html
 *
 * return all the chaps for given manga
 * [
 *     {
 *         name:'xx',
 *         num: xx
 *         url: 'xx'
 *         at: dateStr
 *     }
 * ]
 * @return {[type]} [description]
 */
Importer.prototype.fetchMangaDetail = async function (chap) {
  const uri = chap.url.split('/')
  const idx = uri.indexOf('manga')
  const url = uri.slice(0, idx + 2).join('/') + '/'
  config.logger.dbg('fetching', url)

  const $ = await this.domFetch(url)
  return $('.detail-main-list > li').map((i, x) => {
    const $x = $(x)
    const a = $x.find('a')
    let name = $x.find('.title3').text()
    name = name.substring(name.indexOf('-')+1).trim()
    const url = a.attr('href')
    const num = parseFloat(url.match(/c[0-9.]+/)[0].substring(1))
    let at = $x.find('.detail-main-list-main .title2').text()
    at = this.parseDateDetail(at)
    return { name, url, num, at }
  }).toArray()
}
module.exports = Importer
