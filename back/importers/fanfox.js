import Base from './base.js'
import config from '../config/index.js'
import errorHandler from '../lib/errorHandler.js'
import safeRegExp from '../lib/safeRegExp.js'
class Importer extends Base {
  constructor () {
    super()
    this.allUrl = 'https://fanfox.net/releases/'
    this.from = 'fanfox'
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
    const url = this.ensureAbsoluteUrl(a.attr('href'))
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
Importer.prototype.linkFromChap = function (chap) {
  const uri = chap.url.split('/')
  const idx = uri.indexOf('manga')
  return uri.slice(0, idx + 2).join('/') + '/'
}
/**
 * url maps to a chapter view. e.g
 * http://fanfox.net/manga/onepunch_man/vTBD/c122/1.html
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
  const $ = await this.domFetch(link)
  const authors = $('.detail-info-right-say a[href^="/search/author"]').map((_, $el) => {
    return $el.attribs.title
  }).toArray()
  const arr = $('.detail-main-list > li').map((i, x) => {
    const $x = $(x)
    const a = $x.find('a')
    let name = $x.find('.title3').text()
    name = name.substring(name.indexOf('-') + 1).trim()
    const url = this.ensureAbsoluteUrl(a.attr('href').trim())
    const num = parseFloat(url.match(/c[0-9.]+/)[0].substring(1))
    let at = $x.find('.detail-main-list-main .title2').text()
    at = this.parseDateDetail(at)
    return { name, url, num, at }
  }).toArray()
  if (arr.length === 0 && $('.detail-block-content').length) {
    return errorHandler.importerRequiresInteraction(link)
  }
  if (!chap) {
    chap = {
      name: $('.detail-info-right-title-font').text(),
      thumbUrl: $('.detail-info-cover-img').attr('src')
    }
  }
  if (!chap.description) {
    let txt = $('.detail-info-right-content').text()
    const a = $('.detail-info-right-content a').text()
    if (txt) {
      txt = txt.replace(new RegExp('\\s*' + safeRegExp.escape(a) + '\\s*$'), '')
      chap.description = txt.trim()
    }
  }
  chap.authors = authors
  return { chapters: arr, manga: chap }
}
export default Importer
