import assert from 'assert'
import Mocker from '../../lib/mocker.js'
import safeRegExp from '../../lib/safeRegExp.js'
describe('lib/safeRegExp', function () {
  it('safeRegExp', Mocker.mockIt(async mokr => {
    const s = '+ Tic Neesan'
    assert.strictEqual(safeRegExp.escape(s), '\\+ Tic Neesan')
  }))
})
