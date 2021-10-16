import assert from 'assert'
import utils from '../utils/index.js'
import UserModel from '../../models/userModel.js'
import Mocker from '../../lib/mocker.js'

utils.bindDb()
describe('models/userModel.js', function () {
  beforeEach(utils.clearColls([UserModel]))

  describe('findOneForSure', () => {
    it('finds a user for sure', () => {
      return UserModel.create({ displayName: 'a' }).then(u => {
        return UserModel.findOneForSure({ displayName: 'a' })
      }).then(u => {
        assert(u)
      })
    })

    it('finds a lean user for sure', () => {
      return UserModel.create({ displayName: 'a' }).then(u => {
        return UserModel.findOneForSure({ displayName: 'a' }).lean()
      }).then(u => {
        assert(u)
        assert(!(u instanceof UserModel))
      })
    })

    it('throws if not found', () => {
      let thrown = false
      return UserModel.create({ displayName: 'a' }).then(async u => {
        return UserModel.findOneForSure({ googleId: 2 })
      }).catch(e => {
        thrown = true
        assert.strictEqual(e.status, 404)
      }).then(x => {
        assert(thrown)
      })
    })
  })

  describe('saveManga', () => {
    it('always trust updatedAt', Mocker.mockIt(async function (mokr) {
      const id = '0'.repeat(24)
      const a = { updatedAt: 2, num: 5, mangaId: id }
      const u = await UserModel.create({ displayName: 'a', mangas: { [id]: a } })
      {
        const { state, updatedAt, num } = u.mangas.get(id)
        assert.strictEqual(state, 'write')
        assert.strictEqual(updatedAt, 2)
        assert.strictEqual(num.valueOf(), 5)
      }
      {
        const { state, updatedAt, num, _id } = await u.saveManga({ mangaId: id, num: 6, updatedAt: 1 })
        assert.strictEqual(_id.toString(), id)
        assert.strictEqual(state, 'write')
        assert.strictEqual(updatedAt, 1)
        assert.strictEqual(num.valueOf(), 6)
      }
    }))
  })

  describe('removeManga', () => {
    it('mark the manga as deleted', Mocker.mockIt(async function (mokr) {
      const id = '0'.repeat(24)
      const a = { updatedAt: 2, num: 5, mangaId: id }
      const u = await UserModel.create({ displayName: 'a', mangas: { [id]: a } })
      {
        const { state, updatedAt } = await u.removeManga({ mangaId: '0', updatedAt: 1 })
        assert.strictEqual(state, 'deleted')
        assert.strictEqual(updatedAt, 1)
      }
    }))

    it('does not mark the manga if not existing', Mocker.mockIt(async function (mokr) {
      const u = await UserModel.create({ displayName: 'a' })
      {
        const { state, updatedAt } = await u.removeManga({ mangaId: '0', updatedAt: 1 })
        assert.strictEqual(state, 'deleted')
        assert.strictEqual(updatedAt, 1)
        assert.strictEqual(u.mangas.size, 0)
      }
    }))
  })
})
