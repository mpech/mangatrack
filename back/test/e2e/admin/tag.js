import assert from 'assert'
import utils from '../../utils/index.js'
import Mocker from '../../../lib/mocker.js'
import Activity from '../../../activity/tagActivity.js'
import AtModel from '../../../models/oauth/atModel.js'
import UserModel from '../../../models/userModel.js'

utils.bindApp()
describe('e2e/admin/tag', function () {
  beforeEach(utils.clearColls([AtModel, UserModel]))
  it('upserts tag', Mocker.mockIt(async function (mokr) {
    let called = false
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId })
    ])
    mokr.mock(Activity.prototype, 'tag', async ({ word, tags }) => {
      assert.strictEqual(word, 'abcdef')
      assert.deepStrictEqual(tags, ['jn'])
      called = true
      return { _id: '1'.repeat(24), word, tags }
    })
    const { body: tag } = await utils.requester
      .put('/admin/tags')
      .send({ word: 'abcdef', tags: ['jn'] })
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)

    assert(called)
    assert.deepStrictEqual(tag, { word: 'abcdef', tags: ['jn'], type: 'db' })
  }))

  it('rejects if missing tags', async () => {
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId })
    ])
    return utils.requester
      .put('/admin/tags')
      .send({ word: 'abcdef' })
      .set({ Authorization: 'Bearer ' + token })
      .expect(400)
  })

  it('rejects if missing word', async () => {
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId })
    ])
    return utils.requester
      .put('/admin/tags')
      .send({ tags: ['jn'] })
      .set({ Authorization: 'Bearer ' + token })
      .expect(400)
  })

  it('rejects if invalid tags', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId })
    ])
    return utils.requester
      .put('/admin/tags')
      .send({ tags: ['jn', 'gro'] })
      .set({ Authorization: 'Bearer ' + token })
      .expect(400)
  }))
})
