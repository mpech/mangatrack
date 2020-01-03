import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Me from '../../src/views/me'

it('separates my mangas by unread and up to date', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  const makeManga = (name, num) => {
    const a = name
    return { id: a, name: a, nameId: 'key is id, not nameId', thumbUrl: a, lastChap: { num, url: a, at: 1 } }
  }
  const store = new Vuex.Store({
    state: {
      myMangas: {
        d: 100,
        a: 100,
        c: 120,
        b: 100
      },
      myPopulatedMangas: [
        makeManga('a', 100), // all read
        makeManga('b', 122), // two to read
        makeManga('c', 122), // three to read
        makeManga('d', 100) // all read
      ],
      moreMangas: {
        next: 'a'
      }
    }
  })
  const wrapper = shallowMount(Me, { store, localVue })
  expect(wrapper.vm.newMangas.length).toBe(2)
  expect(wrapper.vm.newMangas.map(x => x.id).join('')).toBe('bc')
  expect(wrapper.vm.upToDateMangas.length).toBe(2)
  expect(wrapper.vm.upToDateMangas.map(x => x.id).join('')).toBe('ad')
})