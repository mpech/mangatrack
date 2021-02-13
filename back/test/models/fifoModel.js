const assert = require('assert')
const utils = require('../utils/')
const FifoModel = require('../../models/fifoModel')
const Mocker = require('../../lib/mocker')
const mongoose = require('mongoose')
const APH = require('../../lib/asyncPromiseHandler')

utils.bindDb()
describe('models/fifoModel', function () {
  beforeEach(utils.clearColls([FifoModel]))

  describe('load', () => {
    it('find existing one', async () => {
      await FifoModel.create({ type: 'link', tasks: [1, 2 ] })
      const f = await FifoModel.load('link')
      assert.strictEqual(f.tasks.length, 2)
    })

    it('upserts one', async () => {
      const f = await FifoModel.load('link')
      assert.strictEqual(f.tasks.length, 0)
      const r = await FifoModel.findOne({ type: 'link' })
      assert(r)
    })
  })

  describe('restart', () => {
    it('does nothing if no tasks', async () => {
      const f = new FifoModel({ tasks: [] })
      let called = false
      const fn = () => called = true
      await f.restart(fn)
      return APH.all().then(() => {
        assert.ok(!called)
      })
    })

    it('processes second task with delay', async () => {
      const f = new FifoModel({ type: 'link', tasks: [{ delay: 0, params: 'a'}, { delay: 20, params: 'b'}] })
      let called = { a: false, b: false }
      const now = Date.now()
      const fn = async ({ params }) => {
        assert.ok(params === 'a' || params === 'b')
        called[params] = true
        if (params === 'a') {
          // check first task is indeed been unsaved
          const f = await FifoModel.findOne({ type: 'link' })
          assert.strictEqual(f.tasks.length, 1)
          assert.strictEqual(f.tasks[0].params, 'b')
          return new Promise(resolve => setTimeout(resolve, 10))
        }
        const delay = Date.now() - now
        assert.ok(delay >= 30, `expected 30 (last task end + b delay), got ${delay}`)
      }
      await f.restart(fn)
      return APH.all().then(() => {
        assert.ok(called.a)
        assert.ok(called.b)
      })
    })
  })

  describe('queue', () => {
    it('does nothing if already processing', async () => {
      const f = new FifoModel({ type: 'link', tasks: [{}] })
      const called = false
      f.restart = () => called = true
      await f.queue({ mangaId: 1 }, 0)
      const dbFifo = await FifoModel.findOne({ type: 'link' })
      assert.deepEqual(dbFifo.tasks, [{}, { delay: 0, params: { mangaId: 1 } }])

      return APH.all().then(() => assert.ok(!called))
    })

    it('restarts the fifo if stalled', async () => {
      const f = new FifoModel({ type: 'link', tasks: [] })
      let called = false
      f.restart = () => called = true
      await f.queue({ mangaId: 2 }, 1)
      const dbFifo = await FifoModel.findOne({ type: 'link' })
      assert.deepEqual(dbFifo.tasks, [{ delay: 1, params: { mangaId: 2 } }])

      return APH.all().then(() => assert.ok(called))
    })
  })
})
