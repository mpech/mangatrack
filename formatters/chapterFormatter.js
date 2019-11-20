var Base = require('./baseFormatter')
class Formatter extends Base {}

Formatter.prototype.format = function (x) {
  return Promise.resolve({
    num: x.num,
    url: x.url,
    at: x.at
  })
}

Formatter.prototype.paginate = function (o) {
  return o
}

module.exports = Formatter
