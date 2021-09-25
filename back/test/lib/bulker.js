const assert = require('assert')
const bulker = require('../../lib/bulker')
const Mocker = require('../../lib/mocker')

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
    const init = Date.now()
    let base = init
    const arr = []
    const delays = []
    return bulker.throttle([1, 2, 3, 4, 5, 6], 2, 7, x => {
      if (x === 1 || x === 3 || x === 5) {
        delays.push(Date.now() - base)
        base = Date.now()
      }
      arr.push(x)
      return x
    }).then(_ => {
      const now = Date.now()
      assert.strictEqual(arr.join(','), '1,2,3,4,5,6')
      assert.strictEqual(delays.length, 3)
      const [a, b, c] = delays
      assert(a < 4, `does not wait for first bulk ${a}`)
      assert(b >= 7, `must wait at least 7s between bulks b(${b})`)
      assert(b <= 11, 'more than 4ms error for setTimeout??')
      assert(c >= 7, `must wait at least 7s between bulks c(${c})`)
      assert(c <= 11, 'more than 4ms error for setTimeout??')
      assert(now - init < a + b + c + 4, 'does not wait after last bulk')
    })
  }))
})
