import LinkActivity from '../activity/linkActivity.js'
import RefreshActivity from '../activity/refreshActivity.js'
import bulker from '../lib/bulker.js'
import utils from '../test/utils/index.js'
import ctx from '../lib/ctx.js'
import importers from '../importers/index.js'
import errorHandler from '../lib/errorHandler.js'
import { fileURLToPath } from 'url'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export const run = async function (name, ts) {
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

export default { run }
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const optimist = yargs(hideBin(process.argv))
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
