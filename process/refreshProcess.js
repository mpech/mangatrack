const Activity = require('../activity/importerActivity')
const bulker = require('../lib/bulker')
const utils = require('../test/utils')

function run (name, ts) {
  const importers = [
    require('../importers/mangakakalot')
  ]

  const activities = importers.map(x => {
    return new Activity(Reflect.construct(x, []))
  })

  const res = bulker.bulk(activities, 10, activity => {
    return activity.refresh()
  })
  return res
}

module.exports = { run }
if (!module.parent) {
  // TODO cli to filter the importer you want to run
  utils.runImport(_ => {
    return run()
  })
}
