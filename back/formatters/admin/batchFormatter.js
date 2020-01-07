var Base = require('../baseFormatter')
class Formatter extends Base {
  async format ({ _id, link, at, status, reason }) {
    return {
      id: _id,
      link,
      at,
      status,
      reason: reason || ''
    }
  }
}

module.exports = Formatter
