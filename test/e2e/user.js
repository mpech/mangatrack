var utils = require('../utils')
var Mocker = require('../../lib/mocker')
var MangaModel = require('../../models/mangaModel')

utils.bindApp()
describe('e2e user', function () {
  beforeEach(utils.clearColls([MangaModel]))

  it.skip('list user', Mocker.mockIt(function (mokr) {
    return utils.requester
      .get('/mangas')
      .expect(200)
      .then(function (res) {
        console.log('OK ', res.body)
      })
  }))
})
