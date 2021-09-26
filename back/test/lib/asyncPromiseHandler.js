import assert from 'assert'
import APH from '../../lib/asyncPromiseHandler.js'
import Mocker from '../../lib/mocker.js'
import { promisify } from 'util'
const nextTick = promisify(process.nextTick)
describe('lib/asyncPromiseHandler', function () {
  afterEach(() => APH.clear())
  describe('set', () => {
    it('throws if unknown set key', () => {
      assert.throws(() => APH.set('test', true), { message: 'expect key stackEnabled' })
    })
    it('does not throw if key stackEnabled', Mocker.mockIt(mokr => {
      assert(!APH.stackEnabled)
      mokr.pre(() => APH.set('stackEnabled', true))
      mokr.aft(() => APH.set('stackEnabled', false))
      assert(APH.stackEnabled)
    }))
  })

  describe('all', () => {
    it('awaits for all promises', Mocker.mockIt(async mokr => {
      mokr.pre(() => APH.set('stackEnabled', true))
      mokr.aft(() => APH.set('stackEnabled', false))
      const called = []
      const makePromise = str => new Promise((resolve, reject) => {
        called[str] = 1
        return resolve()
      })
      APH.tail = makePromise(0)
      APH.tail = makePromise(1)
      APH.tail = makePromise(2)
      await APH.all()
      const [a, b, c] = called
      assert(a, 'a')
      assert(b, 'b')
      assert(c, 'c')
    }))

    it('awaits even if modified stack meanwhile', Mocker.mockIt(async mokr => {
      mokr.pre(() => APH.set('stackEnabled', true))
      mokr.aft(() => APH.set('stackEnabled', false))
      let called
      APH.tail = Promise.resolve().then(() => {
        called = true
        APH.tail = Promise.resolve(2)
      })
      await APH.all()
      assert(called)
    }))
  })

  describe('clear', () => {
    it('clears any stacked promises', Mocker.mockIt(async mokr => {
      mokr.pre(() => APH.set('stackEnabled', true))
      mokr.aft(() => APH.set('stackEnabled', false))
      APH.tail = Promise.resolve(1)
      APH.tail = Promise.resolve(2)
      assert.strictEqual(APH.stack.length, 2)
      assert.strictEqual(APH.stackContext.length, 2)
      APH.clear()
      assert.strictEqual(APH.stack.length, 0)
      assert.strictEqual(APH.stackContext.length, 0)
    }))
  })

  describe('tail', () => {
    it('throws if not stacking promises', Mocker.mockIt(async mokr => {
      mokr.pre(() => APH.set('stackEnabled', true))
      mokr.aft(() => APH.set('stackEnabled', false))
      assert.throws(() => {
        APH.tail = 4
      }, { message: 'must tail promises' })
    }))

    it('silent ignores if not stacking promises', Mocker.mockIt(async mokr => {
      APH.tail = 4
      assert.strictEqual(APH.stack.length, 0)
    }))

    it('catches error, and warns user to catch it via log', Mocker.mockIt(async mokr => {
      let logged
      mokr.mock(console, 'log', (...args) => {
        logged = args
      })
      APH.tail = Promise.reject(new Error('fail'))
      await nextTick()
      assert(logged.join('').includes('catch your errors'), 'has warned user')
    }))

    it('throws if stackEnabled', Mocker.mockIt(async mokr => {
      mokr.pre(() => APH.set('stackEnabled', true))
      mokr.aft(() => APH.set('stackEnabled', false))
      await assert.rejects(async () => {
        APH.tail = Promise.reject(new Error('fail'))
        await APH.all()
      }, { message: 'fail' })
    }))
  })
})
