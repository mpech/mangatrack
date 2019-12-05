const MangaModel = require('../../models/mangaModel')
const ChapterModel = require('../../models/chapterModel')

module.exports = {
  async run () {
    const res = await MangaModel.aggregate([
      {
        $project: {
          minName: {
            $toLower: '$nameId'
          },
          manga: '$$ROOT'
        }
      },
      {
        $group: {
          _id: '$minName',
          mangaIds: {
            $push: '$manga._id'
          },
          manga: { $first: '$manga' }
        }
      },
      {
        $match: {
          'mangaIds.1': { $exists: true }
        }
      }
    ])
    for (const { _id, mangaIds, manga } of res) {
      const chapters = await ChapterModel.find({ mangaId: { $in: mangaIds } }).lean()

      // from->Map<num, chap>
      const fromToChapters = {}
      chapters.forEach(chap => {
        fromToChapters[chap.from] = fromToChapters[chap.from] || new Map()
        chap.chapters.forEach(c => {
          fromToChapters[chap.from].set(c.num, c)
        })
      })

      await Promise.all([
        MangaModel.deleteMany({ _id: { $in: mangaIds } }),
        ChapterModel.deleteMany({ mangaId: { $in: mangaIds } })
      ])

      for (const from in fromToChapters) {
        const chapters = [...fromToChapters[from].values()]
        // canonicalize
        manga.nameId = _id
        manga.chapters = chapters
        await MangaModel.upsertManga(manga, from)
      }
    }
  }
}
