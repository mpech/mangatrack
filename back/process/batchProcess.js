const LinkActivity = require('../activity/linkActivity')
const utils = require('../test/utils')
const importer = require('../importers')
const errorHandler = require('../lib/errorHandler')
const BatchModel = require('../models/batchModel')
const MangaModel = require('../models/mangaModel')

async function runLink (link, ts, options = {}) {
  let selectedImporter = null
  importer.all().some(Imp => {
    const imp = Reflect.construct(Imp, [])
    if (imp.accepts(link)) {
      if (imp.isLinkValid(link)) {
        selectedImporter = imp
        return true
      }
      if (imp.isLinkValid(imp.linkFromChap({ url: link }))) {
        selectedImporter = imp
        link = imp.linkFromChap({ url: link })
        return true
      }
    }
  })

  if (!selectedImporter) {
    return errorHandler.noImporterFound(link)
  }

  const activity = new LinkActivity(selectedImporter)
  return new Promise(resolve => {
    activity.importLink(link, null, options).on('batchended', resolve)
  })
}

async function runId (id, ts, options = {}) {
  const manga = await MangaModel.findOneForSure({ _id: id })
  return runLink(manga.lastChap_url, ts, options)
}

module.exports = { runLink, runId }
if (!module.parent) {
  const optimist = require('yargs')
    .usage(`$0: node batchProcess.js -i link
  Import given link`
    ).options('i', {
      alias: 'input',
      type: 'string',
      describe: '(https://(mangakakalot.com|manganelo.com|fanfox.net)/manga/somename)|mangaId',
      required: true
    })
    .options('f', {
      alias: 'force',
      type: 'boolean',
      describe: 'overrides thumbUrl and description'
    })
  const argv = optimist.argv
  if (argv.help) {
    optimist.showHelp()
    process.exit(0)
  }
  utils.runImport(async _ => {
    const options = argv.force ? { refreshThumb: true, refreshDescription: true } : ({})
    const [method, field] = argv.input.includes('http') ? [runLink, 'link'] : [runId, '_id']
    await BatchModel.deleteMany({ [field]: argv.input })
    const batch = await method(argv.input, Date.now(), options)
    console.log('done', batch)
  })
}
