var rp = require('request-promise-native')
var cheerio = require('cheerio')
class Base {
}
Base.prototype.domFetch = function (url) {
  return rp(url).then(body => {
    const $ = cheerio.load(body, {
      xml: {
        normalizeWhitespace: true
      }
    })
    return $
  })
}
module.exports = Base
