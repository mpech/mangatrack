const Base = require('./baseFormatter')
class Formatter extends Base {}

Formatter.prototype.format = function (x) {
  return Promise.resolve({
    from: x.from,
    chapters: x.chapters.map(({ num, url, at }) => {
      return { num, url, at }
    })
  })
}

Formatter.prototype.paginate = function (o) {
  return o
}

module.exports = Formatter
