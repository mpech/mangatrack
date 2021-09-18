const bulker = require('../../lib/bulker')
const UserModel = require('../../models/userModel')

module.exports = {
  async run () {
    const cursor = UserModel.find().lean().cursor()
    const now = Date.now()
    return bulker.queryStream(cursor, async doc => {
      if (!doc.mangas) { return }
      const mangas = Object.entries(doc.mangas).reduce((m, [id, num]) => {
        if (typeof (num) === 'object') { return m } // skip if patch already run
        return m.set(id, { _id: id, num, updatedAt: now })
      }, new Map())
      if (mangas.size === 0) { return }
      return UserModel.updateOne({ _id: doc._id }, { $set: { mangas } })
    })
  }
}
