const LinkActivity = require('../activity/linkActivity')
const utils = require('../test/utils')
const APH = require('../lib/asyncPromiseHandler')
const MangaModel = require('../models/mangaModel')
const ChapterModel = require('../models/chapterModel')
const FifoModel = require('../models/fifoModel')
const mongoose = require('mongoose')
const importer = require('../importers')
const config = require('../config')

async function run () {
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

module.exports = { run }
if (!module.parent) {
  const optimist = require('yargs')
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
