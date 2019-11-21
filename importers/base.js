var rp = require('request-promise-native')
var cheerio = require('cheerio')
class Base {
}
Base.prototype.domFetch = async function (url) {
  const body = await rp(url)
  const $ = cheerio.load(body, {
    xml: {
      normalizeWhitespace: true
    }
  })
  return $
}
module.exports = Base
