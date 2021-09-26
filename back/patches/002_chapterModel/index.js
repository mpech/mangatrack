import bulker from '../../lib/bulker.js'
import MangaModel from '../../models/mangaModel.js'

export default () => {
  const cursor = MangaModel.find().lean().cursor()
  return bulker.queryStream(cursor, doc => {
    if (!doc.chapters) return Promise.resolve()
    return MangaModel.upsertManga(doc, 'mangakakalot')
  }).then(_ => {
    return new Promise((resolve, reject) => {
      return MangaModel.collection.updateMany({}, { $unset: { chapters: 1 } }, { multi: true }, e => {
        if (e) return reject(e)
        return resolve()
      })
    })
  })
}
