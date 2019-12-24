var Base = require('./baseFormatter')
var ChapterFormatter = require('./chapterFormatter')
class Formatter extends Base {
  constructor () {
    super()
    this.chapterFormatter = new ChapterFormatter()
  }
}

Formatter.prototype.format = async function (x) {
  return {
    id: x._id,
    name: x.name,
    nameId: x.nameId,
    thumbUrl: x.thumbUrl,
    lastChap: {
      num: x.lastChap_num,
      url: x.lastChap_url,
      at: x.lastChap_at
    }
  }
}

Formatter.prototype.formatFull = async function (x) {
  const chapters = await Promise.all(x.chapters.map(c => this.chapterFormatter.format(c)))
  return {
    id: x._id,
    name: x.name,
    nameId: x.nameId,
    thumbUrl: x.thumbUrl,
    lastChap: {
      num: x.lastChap_num,
      url: x.lastChap_url,
      at: x.lastChap_at
    },
    chapters: chapters
  }
}

module.exports = Formatter
