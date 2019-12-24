const bulker = require('../../lib/bulker')
const MangaModel = require('../../models/mangaModel')
const config = require('../../config')

module.exports = {
  async run () {
    const cursor = MangaModel.find({ $expr: { $gt: [{ $strLenCP: '$nameId' }, config.nameId_maxLength] } }).cursor()
    return bulker.queryStream(cursor, doc => {
      doc.nameId = MangaModel.canonicalize(doc.name)
      return doc.save()
    })
  }
}
