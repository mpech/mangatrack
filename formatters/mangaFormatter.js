var Base = require('./baseFormatter')
var ChapterFormatter = require('./chapterFormatter')
class Formatter extends Base {
  constructor () {
    super()
    this.chapterFormatter = new ChapterFormatter()
  }
}

Formatter.prototype.format = async function (x) {
  let p = Promise.resolve()
  if (x.chapters[0]) {
    p = this.chapterFormatter.format(x.chapters[0])
  }

  const chap = await p
  return {
    id: x._id,
    name: x.name,
    nameId: x.nameId,
    thumbUrl: x.thumbUrl,
    lastChap: chap || null
  }
}

Formatter.prototype.formatFull = async function (x) {
  const chapters = await Promise.all(x.chapters.map(c => this.chapterFormatter.format(c)))

  return {
    id: x._id,
    name: x.name,
    nameId: x.nameId,
    thumbUrl: x.thumbUrl,
    lastChap: chapters[0] || null,
    chapters: chapters
  }
}

module.exports = Formatter
