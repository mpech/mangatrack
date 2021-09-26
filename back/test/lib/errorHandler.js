import assert from 'assert'
import errorHandler from '../../lib/errorHandler.js'
import Mocker from '../../lib/mocker.js'

describe('lib/errorHandler', function () {
  it('unknownMangas', Mocker.mockIt(mokr => {
    let thrown = false
    return Promise.resolve().then(_ => {
      return errorHandler.unknownMangas(['a', 'b'])
    }).catch(e => {
      assert.strictEqual(e.message, 'unknown mangas(a,b)')
      thrown = true
    }).then(_ => {
      assert(thrown)
    })
  }))
})
