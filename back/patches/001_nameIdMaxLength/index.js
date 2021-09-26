import bulker from '../../lib/bulker.js'
import MangaModel from '../../models/mangaModel.js'
import config from '../../config/index.js'

export default () => {
  const cursor = MangaModel.find({ $expr: { $gt: [{ $strLenCP: '$nameId' }, config.nameId_maxLength] } }).cursor()
  return bulker.queryStream(cursor, doc => {
    doc.nameId = MangaModel.canonicalize(doc.name)
    return doc.save()
  })
}
