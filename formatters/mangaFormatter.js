var Base = require('./baseFormatter')
var ChapterFormatter = require('./chapterFormatter')
class Formatter extends Base {
  constructor () {
    super()
    this.chapterFormatter = new ChapterFormatter()
  }
}

Formatter.prototype.format = function (x) {
  let p = Promise.resolve()
  if (x.chapters[0]) {
    p = this.chapterFormatter.format(x.chapters[0])
  }

  return p.then(chap => {
    return {
      name: x.name,
      nameId: x.nameId,
      thumbUrl: x.thumbUrl,
      lastChap: chap || null
    }
  })
}

module.exports = Formatter
