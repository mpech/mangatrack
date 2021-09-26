import assert from 'assert'
import utils from '../utils/index.js'
import BatchModel from '../../models/batchModel.js'
import Mocker from '../../lib/mocker.js'

utils.bindDb()
describe('models/batchModel.js', function () {
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
