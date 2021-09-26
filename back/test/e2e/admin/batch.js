import assert from 'assert'
import utils from '../../utils/index.js'
import Mocker from '../../../lib/mocker.js'
import UserModel from '../../../models/userModel.js'
import AtModel from '../../../models/oauth/atModel.js'
import BatchModel from '../../../models/batchModel.js'
import batchProcess from '../../../process/batchProcess.js'

utils.bindApp()
describe('e2e/admin/batch', function () {
  beforeEach(utils.clearColls([UserModel, AtModel, BatchModel]))

  it('get batches', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId }),
      BatchModel.create({ link: 'a', status: 'OK', at: 1, mangaId: '1'.repeat(24) }),
      BatchModel.create({ link: 'b', at: 0 })
    ])

    const { body: { items } } = await utils.requester
      .get('/admin/batches?limit=1')
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)

    assert.strictEqual(items.length, 1)
    assert.strictEqual(items[0].link, 'a')
    assert.strictEqual(items[0].version, 0)
    assert.strictEqual(items[0].mangaId, '1'.repeat(24))
  }))

  it('get batches page 2', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId }),
      BatchModel.create({ link: 'a', status: 'OK', at: 1 }),
      BatchModel.create({ link: 'b', at: 0 })
    ])

    const { body: { items } } = await utils.requester
      .get('/admin/batches?limit=1&offset=1')
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)

    assert.strictEqual(items.length, 1)
    assert.strictEqual(items[0].link, 'b')
  }))

  it('does not get batches if unauth', Mocker.mockIt(async function (mokr) {
    const token = 'abc'
    const res = await utils.requester
      .get('/admin/batches?limit=1')
      .set({ Authorization: 'Bearer ' + token })
      .expect(401)
    assert.strictEqual(res.headers['www-authenticate'], 'Bearer')
  }))

  it('does not get batches if not admin', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: false }),
      AtModel.create({ token, userId })
    ])

    return utils.requester
      .get('/admin/batches?limit=1')
      .set({ Authorization: 'Bearer ' + token })
      .expect(401)
  }))

  it('can import link', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId })
    ])

    mokr.mock(batchProcess, 'runLink', (link, ts, options) => {
      assert(!options.refreshThumb)
      assert(!options.refreshDescription)
      return BatchModel.create({ _id: '0'.repeat(24), link })
    })
    const { body } = await utils.requester
      .post('/admin/batches?limit=1')
      .send({ link: 'xx' })
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)
    assert.strictEqual(body.link, 'xx')
    assert.strictEqual(body.id, '0'.repeat(24))
  }))

  it('can import link with options', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId })
    ])

    mokr.mock(batchProcess, 'runLink', (link, ts, options) => {
      assert(options.refreshThumb)
      assert(options.refreshDescription)
      return BatchModel.create({ _id: '0'.repeat(24), link })
    })
    const { body } = await utils.requester
      .post('/admin/batches?limit=1')
      .send({ link: 'xx', refreshThumb: true, refreshDescription: true })
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)
    assert.strictEqual(body.link, 'xx')
    assert.strictEqual(body.id, '0'.repeat(24))
  }))

  it('can import id', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'a'.repeat(40)
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId })
    ])

    mokr.mock(batchProcess, 'runId', (link, ts, options) => {
      assert(options.refreshThumb)
      assert(options.refreshDescription)
      assert.strictEqual(link, 'xx')
      return BatchModel.create({ _id: '0'.repeat(24), link })
    })
    const { body } = await utils.requester
      .post('/admin/batches?limit=1')
      .send({ id: 'xx', refreshThumb: true, refreshDescription: true })
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)
    assert.strictEqual(body.link, 'xx')
    assert.strictEqual(body.id, '0'.repeat(24))
  }))
})
