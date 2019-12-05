const bulker = require('../../lib/bulker')
const MangaModel = require('../../models/mangaModel')

module.exports = {
  async run () {
    const cursor = MangaModel.find({ nameId: /[A-Z]/ }).lean().cursor()
    return bulker.queryStream(cursor, async doc => {
      doc.nameId = MangaModel.canonicalize(doc.nameId)
      return MangaModel.updateOne({ _id: doc._id }, { $set: { nameId: doc.nameId } })
    })
  }
}
