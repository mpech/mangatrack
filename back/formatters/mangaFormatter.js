import Base from './baseFormatter.js'
import ChapterFormatter from './chapterFormatter.js'
// import { tag } from '../lib/tagger/index.js'
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
    tags: x.tags,
    // tags: await tag(x.name + ' ' + x.description_content), // for now, just do it on the fly because not safe
    taggedWords: x.taggedWords,
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
    description: {
      content: x.description_content,
      from: x.description_from
    },
    tags: x.tags,
    // tags: await tag(x.name + ' ' + x.description_content), // for now, just do it on the fly because not safe
    taggedWords: x.taggedWords,
    lastChap: {
      num: x.lastChap_num,
      url: x.lastChap_url,
      at: x.lastChap_at
    },
    chapters: chapters
  }
}
export default Formatter
