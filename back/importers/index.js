const importers = [
  require('../importers/mangakakalot'),
  require('../importers/fanfox'),
  require('../importers/manganelo')
]
module.exports = {
  all () { return importers }
}
