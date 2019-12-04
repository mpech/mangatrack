const Activity = require('../activity/importerActivity')
const bulker = require('../lib/bulker')
const utils = require('../test/utils')

async function run (name, ts) {
  const importers = [
    require('../importers/mangakakalot'),
    require('../importers/fanfox')
  ]

  const activities = importers.flatMap(x => {
    const importer = Reflect.construct(x, [])
    if (name && importer.from !== name) {
      return []
    }
    return new Activity(importer)
  })
  const res = await bulker.bulk(activities, 1, activity => {
    return activity.refresh()
  })
  return res
}

module.exports = { run }
if (!module.parent) {
  const optimist = require('yargs')
    .usage(`$0: node refreshProcess.js [-i fanfox]
  If -i provided only import from specified importer`
    ).options('i', {
      alias: 'input',
      type: 'string',
      describe: 'only refresh from given importer name. (ChapterModel::from)'
    })
  const argv = optimist.argv
  if (argv.help) {
    optimist.showHelp()
    process.exit(0)
  }
  utils.runImport(_ => {
    return run(argv.input, Date.now())
  })
}
