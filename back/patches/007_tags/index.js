import bulker from '../../lib/bulker.js'
import MangaModel from '../../models/mangaModel.js'
import { tag } from '../../lib/tagger/index.js'
export const run = () => {
  const cursor = MangaModel.find({ 'tags.0': { $exists: false } }).lean().cursor()
  return bulker.queryStream(cursor, async doc => {
    const tags = await tag(doc.name + ' ' + doc.description_content)
    return tags.length > 0 && MangaModel.updateOne({ _id: doc._id }, { $set: { tags } })
  })
}
