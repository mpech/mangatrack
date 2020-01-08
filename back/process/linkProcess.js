const LinkActivity = require('../activity/linkActivity')
const utils = require('../test/utils')
const importer = require('../importers')
const errorHandler = require('../lib/errorHandler')
const BatchModel = require('../models/batchModel')

function run (link, ts) {
  let selectedImporter = null
  importer.all().some(Imp => {
    const imp = Reflect.construct(Imp, [])
    if (imp.accepts(link) && imp.isLinkValid(link)) {
      selectedImporter = imp
      return true
    }
  })

  if (!selectedImporter) {
    return errorHandler.noImporterFound(link)
  }

  const activity = new LinkActivity(selectedImporter)
  return activity.importLink(link)
}

module.exports = { run }
if (!module.parent) {
  const optimist = require('yargs')
    .usage(`$0: node linkProcess.js -i link
  Import given link`
    ).options('i', {
      alias: 'input',
      type: 'string',
      describe: 'https://(mangakakalot.com|manganelo.com|fanfox.net)/manga/somename'
    })
  const argv = optimist.argv
  if (argv.help) {
    optimist.showHelp()
    process.exit(0)
  }
  utils.runImport(async _ => {
    await BatchModel.deleteMany({ link: argv.input })
    return new Promise((resolve, reject) => {
      const ev = run(argv.input, Date.now())
      ev.on('batchended', async _ => {
        try {
          const batch = await BatchModel.findOneForSure({ link: argv.input, status: { $ne: 'PENDING' } })
          console.log('done ', batch)
          return resolve()
        } catch (e) {
          return reject(e)
        }
      })
    })
  })
}
