import bulker from '../../lib/bulker.js'
import MangaModel from '../../models/mangaModel.js'

export const run = async () => {
  const cursor = MangaModel.find({ thumbUrl: /avt.mkklcdnv6.com/ }).lean().cursor()
  return bulker.queryStream(cursor, async doc => {
    const next = doc.thumbUrl.replace('avt.mkklcdnv6.com', 'avt.mkklcdnv6temp.com')
    return MangaModel.updateOne({ _id: doc._id }, { $set: { thumbUrl: next } })
  })
}
