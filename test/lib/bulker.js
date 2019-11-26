var assert = require('assert')
var bulker = require('../../lib/bulker')
var Mocker = require('../../lib/mocker')

describe('lib/bulker', function () {
  it('bulk', Mocker.mockIt(mokr => {
    const arr = []
    return bulker.bulk([1, 2, 3], 1, x => {
      arr.push(x)
      return x
    }).then(_ => assert.strictEqual(arr.join(','), '1,2,3'))
  }))

  it('bulk truncate last', Mocker.mockIt(mokr => {
    const arr = []
    return bulker.bulk([1, 2, 3], 2, x => {
      arr.push(x)
      return x
    }).then(_ => assert.strictEqual(arr.join(','), '1,2,3'))
  }))

  it('debounce', Mocker.mockIt(mokr => {
    const base = Date.now()
    let old = Date.now() - base
    const arr = []
    return bulker.debounce([1, 2, 3, 4], 10, x => {
      if (x > 1 && x !== 4) {
        const t = Date.now() - base
        assert(t - old >= 9, t - old)// timeout now always precise
        old = t
      }
      arr.push(x)
      return x
    }).then(_ => assert.strictEqual(arr.join(','), '1,2,3,4'))
  }))

  it('throttles', Mocker.mockIt(mokr => {
    const ref = Date.now()
    const arr = []
    return bulker.throttle([1, 2, 3, 4, 5, 6], 2, 7, x => {
      arr.push(x)
      return x
    }).then(_ => {
      assert.strictEqual(arr.join(','), '1,2,3,4,5,6')
      const now = Date.now()
      assert(now - ref >= 14, `${now}-${ref}`)
      assert(now - ref <= 18, `${now}-${ref}`)
    })
  }))
})
