const Base = require('../baseFormatter')
class Formatter extends Base {
  async format ({ _id, displayName, admin }) {
    return {
      id: _id,
      displayName,
      admin
    }
  }
}

module.exports = Formatter
