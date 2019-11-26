var Base = require('../mangaFormatter')
class Formatter extends Base {
  async formatFull (x) {
    const res = await super.format(x)
    res.num = x.num
    return res
  }

  async format ({ num, nameId }) {
    return { num, nameId }
  }
}

module.exports = Formatter
