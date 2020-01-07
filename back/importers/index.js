const importers = [
  require('../importers/mangakakalot'),
  require('../importers/fanfox')
]
module.exports = {
  all () { return importers }
}
