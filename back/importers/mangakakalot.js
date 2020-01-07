const Base = require('./base')
var config = require('../config')

class Importer extends Base {
  constructor () {
    super()
    this.allUrl = 'https://mangakakalot.com'
    this.from = 'mangakakalot'
  }

  static accepts (link) {
    return [
      new RegExp('^https://mangakakalot.com/manga/[^/]+/?$', 'i'),
      new RegExp('^https://manganelo.com/manga/[^/]+/?$', 'i')
    ].some(x => x.test(link))
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

Importer.prototype.linkFromChap = function (chap) {
  const uri = chap.url.split('/')
  uri.pop()// chapter
  return uri.join('/').replace('chapter', 'manga')
}
/**
 * url maps to a chapter view. e.g
 * https://mangakakalot.com/chapter/to_you_the_immortal/chapter_110
 *
 * return all the chaps for given manga
 * {
 *   chapters:[
 *     {
 *         name:'xx',
 *         num:xx
 *         url
 *     }
 *   ],
 *   manga: {
 *     name,
 *     thumbUrl
 *  }
 * @return {[type]} [description]
 */
Importer.prototype.fetchMangaDetail = async function (link, chap = null) {
  config.logger.dbg('fetching', link)
  const $ = await this.domFetch(link)
  const chapters = $('.chapter-list .row').map((i, x) => {
    const a = $(x).find('a')
    const name = a.attr('title')
    const url = this.ensureAbsoluteUrl(a.attr('href'))
    const num = parseFloat(url.match(/_([^_]+)$/)[1])
    let at = $(x).find('span[title]').eq(0).attr('title')
    at = this.parseDateDetail(at)
    return { name, url, num, at }
  }).toArray()

  if (!chap) {
    chap = {
      name: $('.manga-info-text h1').text(),
      thumbUrl: $('.manga-info-pic img').attr('src')
    }
  }

  if (!chap.description) {
    const html = $('#noidungm').html()
    if (html) {
      chap.description = html.replace(/<h2.*<\/h2>/, '').trim()
    }
  }
  return { chapters, manga: chap }
}

module.exports = Importer
