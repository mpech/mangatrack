import bulker from '../../lib/bulker.js'
import MangaModel from '../../models/mangaModel.js'
import ChapterModel from '../../models/chapterModel.js'

export default () => {
  const cursor = MangaModel.find({ lastChap_num: { $exists: false } }).lean().cursor()
  const failingList = []
  return bulker.queryStream(cursor, async doc => {
    const [metaChap] = await ChapterModel.aggregate([
      {
        $match: {
          mangaId: doc._id
        }
      },
      {
        $group: {
          _id: '$mangaId',
          chapters: {
            $push: {
              $arrayElemAt: ['$chapters', 0]
            }
          }
        }
      }
    ])
    if (!metaChap) {
      failingList.push(doc._id.toString())
      return
    }
    const chap = metaChap.chapters.reduce((acc, chap) => {
      if (chap.num > acc.num) {
        return chap
      }
      return acc
    }, { num: -1 })
    const o = {}
    o.lastChap_num = chap.num
    o.lastChap_at = chap.at
    o.lastChap_url = chap.url
    return MangaModel.updateOne({ _id: doc._id }, { $set: o })
  }).then(_ => {
    if (failingList.length) {
      console.log('failing list : ', failingList)
      throw new Error('failed for ', failingList.join(','))
    }
  })
}
