const assert = require('assert')
const utils = require('../../utils')
const Mocker = require('../../../lib/mocker')
const UserModel = require('../../../models/userModel')
const AtModel = require('../../../models/oauth/atModel')
const BatchModel = require('../../../models/batchModel')
const linkProcess = require('../../../process/linkProcess')
const EventEmitter = require('events')

utils.bindApp()
describe('e2e/admin/batch', function () {
  beforeEach(utils.clearColls([UserModel, AtModel, BatchModel]))

  it('get batches', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId }),
      BatchModel.create({ link: 'a', status: 'OK', at: 1 }),
      BatchModel.create({ link: 'b', at: 0 })
    ])

    const { body: { items } } = await utils.requester
      .get('/admin/batches?limit=1')
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)

    assert.strictEqual(items.length, 1)
    assert.strictEqual(items[0].link, 'a')
    assert.strictEqual(items[0].version, 0)
  }))

  it('get batches page 2', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
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
    return utils.requester
      .get('/admin/batches?limit=1')
      .set({ Authorization: 'Bearer ' + token })
      .expect(401)
  }))

  it('does not get batches if not admin', Mocker.mockIt(async function (mokr) {
    const userId = '0'.repeat(24)
    const token = 'abc'
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
    const token = 'abc'
    await Promise.all([
      UserModel.create({ _id: userId, googleId: 'g', displayName: 'moran', admin: true }),
      AtModel.create({ token, userId })
    ])

    mokr.mock(linkProcess, 'run', link => {
      const ev = new EventEmitter()
      BatchModel.create({ _id: '0'.repeat(24), link }).then(b => ev.emit('batchstarted', b))
      return ev
    })
    const { body } = await utils.requester
      .post('/admin/batches?limit=1')
      .send({ link: 'xx' })
      .set({ Authorization: 'Bearer ' + token })
      .expect(200)
    assert.strictEqual(body.link, 'xx')
    assert.strictEqual(body.id, '0'.repeat(24))
  }))
})
