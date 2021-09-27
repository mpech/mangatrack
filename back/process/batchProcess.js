import LinkActivity from '../activity/linkActivity.js'
import * as utils from '../test/utils/index.js'
import importer from '../importers/index.js'
import errorHandler from '../lib/errorHandler.js'
import BatchModel from '../models/batchModel.js'
import ChapterModel from '../models/chapterModel.js'
import config from '../config/index.js'
import yargs from 'yargs'
import { fileURLToPath } from 'url'
import { hideBin } from 'yargs/helpers'
export const runLink = async function (link, ts, options = {}) {
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
    return false
  })
  if (!selectedImporter) {
    return errorHandler.noImporterFound(link)
  }
  const activity = new LinkActivity(selectedImporter)
  return new Promise(resolve => {
    activity.importLink(link, null, options).on('batchended', resolve)
  })
}
export const runId = async function (id, ts, options = {}) {
  const from = options.refreshThumb
    ? { from: { $nin: config.excludeCdnImporter } }
    : {}
  const { chapters: [chapter] } = await ChapterModel.findOneForSure({ mangaId: id, ...from }, { chapters: { $first: '$chapters' } })
  return exports.runLink(chapter.url, ts, options)
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const optimist = yargs(hideBin(process.argv)).usage(`$0: node batchProcess.js -i link
  Import given link`).options('i', {
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
  utils.runImport(async (_) => {
    const options = argv.force ? { refreshThumb: true, refreshDescription: true } : ({})
    const [method, field] = argv.input.includes('http') ? [runLink, 'link'] : [runId, '_id']
    await BatchModel.deleteMany({ [field]: argv.input })
    const batch = await method(argv.input, Date.now(), options)
    console.log('done', batch)
  })
}
const exports = { runLink, runId }
export default exports
