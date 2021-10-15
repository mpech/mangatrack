import assert from 'assert'
import utils from '../utils/index.js'
import Activity from '../../activity/tagActivity.js'
import MangaModel from '../../models/mangaModel.js'
import TagModel from '../../models/tagModel.js'

utils.bindDb()
describe('activity/tagActivity', function () {
  beforeEach(utils.clearColls([MangaModel, TagModel]))
  it('tag all matching mangas', async () => {
    const activity = new Activity()
    await MangaModel.create([
      { name: 'abc Jinsoo ', tags: ['jn'], lastChap_at: 2 },
      { name: 'aaa', description_content: 'def Jinsoo', lastChap_at: 1 },
      { name: 'bbb', description_content: 'nope', lastChap_at: 0 }
    ])
    await activity.tag({ word: 'Jinsoo', tags: ['kr'] })
    const [a, b, c] = await MangaModel.find()
    assert.deepStrictEqual(a.tags, ['kr'])
    assert.deepStrictEqual(b.tags, ['kr'])
    assert.deepStrictEqual(c.tags, [])
  })

  it('takes into account tags since last deploy which where added (thus not in txt files)', async () => {
    const activity = new Activity()
    await Promise.all([
      TagModel.create([{ word: 'cna', tags: ['cn'] }, { word: 'cnb', tags: ['cn'] }, { word: 'krb', tags: ['kr'] }]),
      MangaModel.create([
        { name: 'cna cnb krtag', tags: ['cn'], lastChap_at: 2 },
        { name: 'xxx', description_content: 'cna cnb krtag', tags: ['cn'], lastChap_at: 1 },
        { name: 'krtag', description_content: 'cna krb', lastChap_at: 0 },
        { name: 'not matching', lastChap_at: 0 }
      ])
    ])
    await activity.tag({ word: 'krtag', tags: ['kr'] })
    const [a, b, c, d] = await MangaModel.find().sort({ lastChap_at: -1 })
    assert.deepStrictEqual(a.tags, ['cn'], 'simple tag from tagModel (name)')
    assert.deepStrictEqual(b.tags, ['cn'], 'simple tag from tagModel (description_content)')
    assert.deepStrictEqual(c.tags, ['kr'], 'two tags better than one')
    assert.deepStrictEqual(d.tags, [], 'no tag')
  })

  it('tag activity only by nameId', async () => {
    const activity = new Activity()
    await MangaModel.create([
      { name: 'aaa', description_content: 'def lep noo', lastChap_at: 1 },
      { name: 'bbb', description_content: 'def too', lastChap_at: 0 }
    ])
    await activity.tag({ word: 'def', tags: ['kr'], nameId: 'aaa' })
    const [a, b] = await MangaModel.find()
    assert.deepStrictEqual(a.tags, ['kr'])
    assert.deepStrictEqual([...a.taggedWords.entries()], [['def', ['kr']]])
    assert.deepStrictEqual(b.tags, [])
  })
})
