const assert = require('assert')
const utils = require('../utils/')
const BatchModel = require('../../models/batchModel')
const Mocker = require('../../lib/mocker')

utils.bindDb()
describe('models/batchModel', function () {
  beforeEach(utils.clearColls([BatchModel]))

  it('increments batch version', Mocker.mockIt(async function (mokr) {
    const b = await BatchModel.create({ link: 'xx' })
    assert.strictEqual(b.__v, 0)
    b.set('link', 'yy')
    const c = await b.save()
    assert.strictEqual(c, b)
    assert.strictEqual(c.__v, 1)
    assert.strictEqual(b.link, 'yy')
  }))
})
