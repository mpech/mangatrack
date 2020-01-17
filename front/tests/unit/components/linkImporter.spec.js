import { mount } from '@vue/test-utils'
import LinkImporter from '../../../src/components/linkImporter'

it('dispatch event properly with checkbox', async () => {
  const wrapper = mount(LinkImporter)
  wrapper.vm.$el.querySelector('input[name=link]').value = 'mylink'
  wrapper.vm.$el.querySelector('#thumb').checked = true
  wrapper.vm.$el.querySelector('#description').checked = true
  wrapper.vm.onsubmit({ preventDefault: _ => {} })
  await wrapper.vm.$nextTick()

  expect(wrapper.emitted().importLink).toBeTruthy()
  expect(wrapper.emitted().importLink.length).toBe(1)
  const body = wrapper.emitted().importLink[0][0]
  expect(body.link).toStrictEqual('mylink')
  expect(body.refreshThumb).toBe(true)
  expect(body.refreshDescription).toBe(true)
})
