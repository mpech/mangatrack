import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'
import Vue from 'vue'
import Vuex from 'vuex'
import BatchList from './batchList'
import { batch } from './batch.stories.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  actions: {
    async getBatches (context, { offset, limit }) {
      const items = batches.slice(offset, offset + limit)
      return {
        count: batches.length,
        items
      }
    }
  }
})

export const batches = [
  { ...batch, id: 0 },
  { ...batch, status: 'PENDING', link: 'b', id: 1 },
  { ...batch, status: 'PENDING', link: 'c', id: 2 }
]

storiesOf('BatchList', module)
  .add('default', () => {
    return {
      store: store,
      components: {
        'mt-batchList': BatchList
      },
      template: '<mt-batchList :limit="1"/></mt-batchList>',
    }
  })
  .add('two per page', () => {
    return {
      store: store,
      components: {
        'mt-batchList': BatchList
      },
      template: '<mt-batchList :limit="2"/></mt-batchList>',
    }
  })