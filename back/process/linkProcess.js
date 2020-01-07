const Activity = require('../activity/importerActivity')
const bulker = require('../lib/bulker')
const utils = require('../test/utils')
const ctx = require('../lib/ctx')
const importer = require('../importers')
const errorHandler = require('../lib/errorHandler')
const BatchModel = require('../models/batchModel')
const APH = require('../lib/asyncPromiseHandler')

function run (link, ts) {
  const Imp = importer.all().find(Imp => Imp.accepts(link))
  if (!Imp) {
    return errorHandler.noImporterFound(link)
  }

  const activity = new Activity(Reflect.construct(Imp, []))
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
      describe: 'https://(mangakakalot.com|fanfox.net)/manga/somename'
    })
  const argv = optimist.argv
  if (argv.help) {
    optimist.showHelp()
    process.exit(0)
  }
  utils.runImport(_ => {
    return new Promise(async (resolve, reject) => {
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
