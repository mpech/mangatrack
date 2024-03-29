import Base from './base.js'
import config from '../config/index.js'
import safeRegExp from '../lib/safeRegExp.js'
class Importer extends Base {
  constructor () {
    super()
    this.allUrl = 'https://manganelo.com'
    this.from = 'manganelo'
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
  const arr = $('.content-homepage-item').map((i, x) => {
    const $x = $(x)
    const title = $x.find('.item-title').text().trim()
    const lastEl = $x.find('.item-chapter').eq(0)
    const url = this.ensureAbsoluteUrl(lastEl.find('a').attr('href'))
    const last = lastEl.find('i').text()
    const num = parseFloat(lastEl.find('a').attr('href').match(/_([^_]+)$/)[1])
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
  uri.pop() // chapter
  return uri.join('/').replace('chapter', 'manga')
}
/**
 * url maps to a chapter view. e.g
 * https://manganelo.com/chapter/to_you_the_immortal/chapter_110
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
  const authors = $('.story-info-right .a-h[href*="author/"]').map((_, el) => {
    return $(el).text()
  }).toArray()
  const aliasName = $('.story-info-right h2:eq(0)').text()
  const chapters = $('.row-content-chapter li').map((i, x) => {
    const a = $(x).find('a')
    const name = a.attr('title')
    const url = this.ensureAbsoluteUrl(a.attr('href'))
    const num = parseFloat(url.match(/[_-]([^_-]+)$/)[1])
    let at = $(x).find('span[title]').eq(0).attr('title')
    at = this.parseDateDetail(at)
    return { name, url, num, at }
  }).toArray()
  if (!chap) {
    chap = {
      name: $('.story-info-right h1').text(),
      thumbUrl: $('.story-info-left img').attr('src')
    }
  }
  if (!chap.description) {
    let txt = $('#panel-story-info-description').text()
    const h3 = $('#panel-story-info-description h3').text()
    if (txt) {
      txt = txt.replace(new RegExp('^\\s' + safeRegExp.escape(h3) + '\\s*'), '')
      chap.description = txt.trim()
    }
  }
  chap.authors = authors
  chap.aliasName = aliasName
  return { chapters, manga: chap }
}

Importer.prototype.accepts = function (link) {
  return Base.prototype.accepts.call(this, link) || /(?:read)manganato\.com/.test(link)
}
Importer.prototype.isLinkValid = function (link) {
  return Base.prototype.isLinkValid.call(this, link) || /https:\/\/(?:read)manganato\.com\/manga[^/]+\/?$/i.test(link)
}
export default Importer
