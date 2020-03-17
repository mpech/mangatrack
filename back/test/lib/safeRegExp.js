const assert = require('assert')
const Mocker = require('../../lib/mocker')
const safeRegExp = require('../../lib/safeRegExp')
describe('lib/safeRegExp', function () {
  it('safeRegExp', Mocker.mockIt(async mokr => {
    const s = '+ Tic Neesan'
    assert.strictEqual(safeRegExp.escape(s), '\\+ Tic Neesan')
  }))
})
