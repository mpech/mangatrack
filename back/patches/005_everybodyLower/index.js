import bulker from '../../lib/bulker.js'
import MangaModel from '../../models/mangaModel.js'

export default () => {
  const cursor = MangaModel.find({ nameId: /[A-Z]/ }).lean().cursor()
  return bulker.queryStream(cursor, async doc => {
    doc.nameId = MangaModel.canonicalize(doc.nameId)
    return MangaModel.updateOne({ _id: doc._id }, { $set: { nameId: doc.nameId } })
  })
}
