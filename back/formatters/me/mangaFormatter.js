var Base = require('../mangaFormatter')
class Formatter extends Base {
  async format ({ num, mangaId }) {
    return { num, mangaId }
  }
}

module.exports = Formatter
