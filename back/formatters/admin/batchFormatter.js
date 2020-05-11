const Base = require('../baseFormatter')
class Formatter extends Base {
  async format ({ _id, link, at, status, reason, __v, mangaId }) {
    return {
      id: _id,
      link,
      at,
      status,
      reason: reason || '',
      version: __v,
      mangaId
    }
  }
}

module.exports = Formatter
