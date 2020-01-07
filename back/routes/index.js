var routers = [
  require('./oauth'),
  require('./mangas'),
  require('./me/mangas'),
  require('./me/me'),
  require('./admin/batch')
]
module.exports = {
  load: function (app) {
    routers.forEach(x => x.load(app))
  }
}
