const Base = require('./base')
var config = require('../config')

class Importer extends Base {
  constructor () {
    super()
    this.allUrl = 'https://mangakakalot.com'
    this.from = 'mangakakalot'
  }
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
Importer.prototype.allUpdates = async function () {
  const $ = await this.domFetch(this.allUrl)
  const arr = $('.itemupdate').map((i, x) => {
    const $x = $(x)
    const title = $x.find('h3 a').text()
    const li = $x.find('li:nth-child(2)').eq(0)
    const url = this.ensureAbsoluteUrl(li.find('a').attr('href'))
    const last = li.find('i').text()
    const num = parseFloat(li.find('a').attr('href').match(/_([^_]+)$/)[1])
    const thumbUrl = $x.find('img').attr('src')
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
Importer.prototype.fetchMangaDetail = async function (chap) {
  const uri = chap.url.split('/')
  uri.pop()// chapter
  const url = uri.join('/').replace('chapter', 'manga')
  config.logger.dbg('fetching', url)

  const $ = await this.domFetch(url)
  return $('.chapter-list .row').map((i, x) => {
    const a = $(x).find('a')
    const name = a.attr('title')
    const url = this.ensureAbsoluteUrl(a.attr('href'))
    const num = parseFloat(url.match(/_([^_]+)$/)[1])
    let at = $(x).find('span[title]').eq(0).attr('title')
    at = this.parseDateDetail(at)
    return { name, url, num, at }
  }).toArray()
}

module.exports = Importer
