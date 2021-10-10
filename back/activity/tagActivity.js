import MangaModel from '../models/mangaModel.js'
import bulker from '../lib/bulker.js'
import TagModel from '../models/tagModel.js'
import { tag } from '../lib/tagger/index.js'

class TagActivity {}
TagActivity.prototype.tag = async ({ word, tags, nameId }) => {
  const backTag = word ? await TagModel.findOneAndUpdate({ word }, { word, tags }, { new: true, upsert: true }) : {}

  const wordRegex = new RegExp(word)
  const [mangas, { additionalTags, stopTags }] = await Promise.all([
    MangaModel.find({
      $or: [
        { description_content: wordRegex },
        { name: wordRegex }
      ],
      ...(nameId ? { nameId } : {})
    }),
    TagModel.find().lean().then(tags => {
      const additionalTags = { kr: new Set(), cn: new Set(), jn: new Set() }
      const stopTags = new Set()
      tags.forEach(tagModel => {
        if (tagModel.tags.length === 0) {
          stopTags.add(tagModel.word)
        } else {
          tagModel.tags.forEach(tag => additionalTags[tag].add(tagModel.word))
        }
      })
      return { additionalTags, stopTags }
    })
  ])
  await bulker.bulk(mangas, 20, async m => {
    const out = { taggedWords: new Map() }
    m.tags = await tag(m.getTaggableText(), { tags: additionalTags, stopTags }, out)
    m.taggedWords = out.taggedWords
    // console.log('ff', m.tags, m.taggedWords)
    return m.save()
  })

  return backTag
}

export default TagActivity
