import assert from 'assert'
import utils from '../utils/index.js'
import Mocker from '../../lib/mocker.js'
import Importer from '../../importers/base.js'
utils.bindDb()
describe('importers/base', function () {
  it('parseDate min ago', Mocker.mockIt(mokr => {
    const importer = new Importer()
    const ref = new Date(2019, 10, 13, 10)
    let d = new Date(importer.parseDate('42 mins ago', ref.getTime()))
    assert(d.toString().includes('Nov 13 2019 09:18:00'))
    d = new Date(importer.parseDate('2 hour ago', ref.getTime()))
    assert(d.toString().includes('Nov 13 2019 08:00:00'))
  }))

  it('parseDateDetail (mangakakalot detail) mm-dd hh:mm', Mocker.mockIt(mokr => {
    const importer = new Importer()
    const ref = new Date(2019, 10, 13, 10)
    const d = new Date(importer.parseDate('11-05 16:04', ref.getTime()))
    const expect = 'Sat Nov 05 2022 16:04:00'
    assert.strictEqual(d.toString().substring(0, expect.length), expect)
  }))

  it('parseDateDetail', Mocker.mockIt(mokr => {
    const importer = new Importer()
    const ts = importer.parseDateDetail('1 day ago', 1576436400000)
    const date = new Date(ts)
    assert.strictEqual(date.getDate(), 14)
  }))

  it('parseDateDetail: Yesterday', Mocker.mockIt(mokr => {
    const importer = new Importer()
    const ts = importer.parseDateDetail('Yesterday', 1576436400000)
    const date = new Date(ts)
    assert.strictEqual(date.getDate(), 14)
  }))

  it('parseDateDetail: yesterday', Mocker.mockIt(mokr => {
    const importer = new Importer()
    const ts = importer.parseDateDetail('yesterday', 1576436400000)
    const date = new Date(ts)
    assert.strictEqual(date.getDate(), 14)
  }))

  it('parseDateDetail: today', Mocker.mockIt(mokr => {
    const importer = new Importer()
    const ts = importer.parseDateDetail('oday', 1576436400000)
    const date = new Date(ts)
    assert.strictEqual(date.getDate(), 15)
  }))

  it('parseDateDetail: (fanfox detail) Nov 27,2019', Mocker.mockIt(mokr => {
    const importer = new Importer()
    const ts = importer.parseDateDetail('Nov 27,2019')
    const date = new Date(ts)
    assert.strictEqual(date.getDate(), 27)
    assert.strictEqual(date.getMonth(), 10)
    assert.strictEqual(date.getFullYear(), 2019)
  }))
})
