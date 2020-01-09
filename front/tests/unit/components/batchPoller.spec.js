import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import BatchPoller from '../../../src/components/batchPoller'

it('repoll upon batch add', async () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use({
    install (Vue) {
      Vue.prototype.$notify = x => {}
    }
  })
  await new Promise((resolve, reject) => {
    const store = new Vuex.Store({
      actions: {
        async getAllBatchesById (context, ids) {
          expect(ids).toStrictEqual(['123'])
          resolve()
          return { items: [{ id: '123', status: 'OK' }] }
        }
      }
    })
    const wrapper = mount(BatchPoller, { store, localVue })
    wrapper.setProps({ ids: ['123'] })
    expect(wrapper.vm.ids).toStrictEqual(['123'])
  })
})

it('ignores processed batchIds', async () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use({
    install (Vue) {
      Vue.prototype.$notify = x => {}
    }
  })
  await new Promise((resolve, reject) => {
    const store = new Vuex.Store({
      actions: {
        async getAllBatchesById (context, ids) {
          expect(ids).toStrictEqual(['456'])
          resolve()
          return { items: [] }
        }
      }
    })
    const wrapper = mount(BatchPoller, { store, localVue })
    wrapper.setData({ doneIds: { 123: true } })
    wrapper.setProps({ ids: ['123', '456'] })
  })
})

it('marks batchIds as done', async () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use({
    install (Vue) {
      Vue.prototype.$notify = x => {}
    }
  })
  const wrapper = await new Promise((resolve, reject) => {
    const store = new Vuex.Store({
      actions: {
        async getAllBatchesById (context, ids) {
          return {
            items: [
              { id: '1', status: 'OK' },
              { id: '2', status: 'PENDING' },
              { id: '3', status: 'KO' }
            ]
          }
        }
      }
    })
    const wrapper = mount(BatchPoller, { store, localVue })
    const fwdRefresh = wrapper.vm.refresh.bind(wrapper.vm)
    wrapper.setMethods({
      async refresh () {
        await fwdRefresh()
        resolve(wrapper)
      }
    })
    wrapper.setProps({ ids: ['1', '2', '3'] })
  })
  expect(wrapper.vm.batchIds).toStrictEqual(['2'])
  expect(Object.keys(wrapper.vm.batchIds).length).toBe(1)
})
