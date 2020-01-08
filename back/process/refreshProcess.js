const LinkActivity = require('../activity/linkActivity')
const RefreshActivity = require('../activity/refreshActivity')
const bulker = require('../lib/bulker')
const utils = require('../test/utils')
const ctx = require('../lib/ctx')
const importers = require('../importers')
const errorHandler = require('../lib/errorHandler')

async function run (name, ts) {
  const fromToLinkActivity = {}
  const activities = importers.all().flatMap(x => {
    const importer = Reflect.construct(x, [])
    fromToLinkActivity[importer.from] = new LinkActivity(importer)
    if (name && importer.from !== name) {
      return []
    }
    return new RefreshActivity(importer, fromToLinkActivity)
  })

  if (activities.length === 0) {
    return errorHandler.noImporterFound(name)
  }

  const mdw = ctx.express()
  const res = await bulker.bulk(activities, 1, activity => {
    return new Promise((resolve, reject) => {
      mdw(null, null, function () {
        ctx.set('sid', activity.imp.from)
        return activity.refresh().then(resolve).catch(reject)
      })
    })
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
