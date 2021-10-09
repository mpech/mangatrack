import MangaModel from '../models/mangaModel.js'
import bulker from '../lib/bulker.js'
import TagModel from '../models/tagModel.js'
import { tag } from '../lib/tagger/index.js'

class TagActivity {}
TagActivity.prototype.tag = async ({ word, tags }) => {
  const backTag = await TagModel.findOneAndUpdate({ word }, { word, tags }, { new: true, upsert: true })

  const wordRegex = new RegExp(word)
  const [mangas, additionalTags] = await Promise.all([
    MangaModel.find({
      $or: [
        { description_content: wordRegex },
        { name: wordRegex }
      ]
    }),
    TagModel.find().lean().then(tags => {
      const additionalTags = { kr: new Set(), cn: new Set(), jn: new Set() }
      tags.forEach(tagModel => tagModel.tags.forEach(tag => additionalTags[tag].add(tagModel.word)))
      return additionalTags
    })
  ])

  await bulker.bulk(mangas, 20, async m => {
    m.tags = await tag(m.getTaggableText(), additionalTags)
    return m.save()
  })

  return backTag
}

export default TagActivity
