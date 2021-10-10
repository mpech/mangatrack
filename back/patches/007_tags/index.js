import bulker from '../../lib/bulker.js'
import MangaModel from '../../models/mangaModel.js'
import { tag } from '../../lib/tagger/index.js'
import TagActivity from '../../activity/tagActivity.js'

export const run = async () => {
  // const cursor = MangaModel.find({ 'tags.0': { $exists: false } }).lean().cursor()
  const cursor = MangaModel.find({ taggedWords: { $exists: false } }).lean().cursor()
  const activity = new TagActivity()
  const tagSets = await activity.getTagSets()
  return bulker.queryStream(cursor, async doc => {
    const out = {}
    const tags = await tag(doc.name + ' ' + doc.description_content, tagSets, out)
    const taggedWords = out.taggedWords
    return MangaModel.updateOne({ _id: doc._id }, { $set: { tags, taggedWords } })
  })
}
