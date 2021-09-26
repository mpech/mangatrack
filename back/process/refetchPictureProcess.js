import LinkActivity from '../activity/linkActivity.js'
import utils from '../test/utils/index.js'
import APH from '../lib/asyncPromiseHandler.js'
import MangaModel from '../models/mangaModel.js'
import ChapterModel from '../models/chapterModel.js'
import FifoModel from '../models/fifoModel.js'
import mongoose from 'mongoose'
import importer from '../importers/index.js'
import config from '../config/index.js'
import yargs from 'yargs'
import { fileURLToPath } from 'url'
import { hideBin } from 'yargs/helpers'

export const run = async function () {
  const mangas = await MangaModel.find({ thumbUrl: /avt\.mkklcdnv6temp\.com/ }, { thumbUrl: 1 }).lean()
  const mangaIds = mangas.map(m => mongoose.Types.ObjectId(m._id))
  const urls = await ChapterModel.aggregate([
    { $match: { mangaId: { $in: mangaIds }, from: { $nin: config.excludeCdnImporter } } },
    { $group: { _id: '$mangaId', chapters: { $first: '$chapters' } } },
    { $project: { chapter: { $first: '$chapters' } } },
    { $project: { url: '$chapter.url' } }
  ])

  const { nameToActivity, imps } = importer.all().reduce(({ imps, nameToActivity }, Imp) => {
    const imp = Reflect.construct(Imp, [])
    const activity = new LinkActivity(imp)
    nameToActivity.set(imp.from, activity)
    imps.push(imp)
    return { imps, nameToActivity }
  }, { nameToActivity: new Map(), imps: [] })

  const vArgs = urls.flatMap(({ url }) => {
    const imp = imps.find(imp => {
      return imp.accepts(url) && imp.isLinkValid(imp.linkFromChap({ url }))
    })
    if (!imp) {
      console.log('...TODO no importer for saved', url)
      return []
    }
    return {
      link: imp.linkFromChap({ url }),
      name: imp.from
    }
  }, new Map())

  const fn = async ({ args: { link, name } }) => {
    const activity = nameToActivity.get(name)
    const options = { refreshThumb: true, refreshDescription: false }
    return new Promise(resolve => {
      return activity.importLink(link, null, options).on('batchended', resolve)
    })
  }
  const fifo = await FifoModel.load('link')
  await fifo.queueAll(vArgs, 2000)
  APH.tail = fifo.restart(fn)
}

export default { run }
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const optimist = yargs(hideBin(process.argv))
    .usage('$0: node refetchPictureProcess.js')
  const argv = optimist.argv

  if (argv.help) {
    optimist.showHelp()
    process.exit(0)
  }

  utils.runImport(async () => {
    APH.set('stackEnabled', true)
    await run()
    await APH.all()
    console.log('done')
  })
}
