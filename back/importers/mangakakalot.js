import Base from './base.js'
import config from '../config/index.js'
import safeRegExp from '../lib/safeRegExp.js'
import errorHandler from '../lib/errorHandler.js'
import ManganeloImporter from './manganelo.js'
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
    const num = parseFloat(li.find('a').attr('href').match(/[_-]([^_-]+)$/)[1])
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
Importer.prototype.fetchMangaDetail = async function (link, chap = null, seen = new Set()) {
  if (seen.has(link)) {
    return errorHandler.tooManyRedirect()
  }
  seen.add(link)
  const $ = await this.domFetch(link)
  const authors = $('.manga-info-text a[href*="/search_author"], .manga-info-text a[href*="/search/author"]').map((_, el) => {
    return $(el).text()
  }).toArray()
  const aliasName = $('.manga-info-text .story-alternative').text()
  const chapters = $('.chapter-list .row').map((i, x) => {
    const a = $(x).find('a')
    const name = a.attr('title')
    const url = this.ensureAbsoluteUrl(a.attr('href'))
    const num = parseFloat(url.match(/_([^_]+)$/)[1])
    let at = $(x).find('span[title]').eq(0).attr('title')
    at = this.parseDateDetail(at)
    return { name, url, num, at }
  }).toArray()
  if (chapters.length === 0) {
    // handle js redirect ?
    const url = $.html().match(/location\.assign\(['"]([^'"]+)['"]\)/)
    if (url && this.accepts(url[1])) {
      return this.fetchMangaDetail(url[1], chap, seen)
    }
    const importer = new ManganeloImporter()
    if (url && importer.accepts(url[1])) {
      return importer.fetchMangaDetail(url[1], chap, seen)
    }
  }
  if (!chap) {
    chap = {
      name: $('.manga-info-text h1').text(),
      thumbUrl: $('.manga-info-pic img').attr('src')
    }
  }
  if (!chap.description) {
    let txt = $('#noidungm').text()
    const h2 = $('#noidungm h2').text()
    if (txt) {
      txt = txt.replace(new RegExp('^\\s*' + safeRegExp.escape(h2) + '\\s*'), '')
      chap.description = txt.trim()
    }
  }
  chap.authors = authors
  chap.aliasName = aliasName
  return { chapters, manga: chap }
}
export default Importer
