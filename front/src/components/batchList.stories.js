import { storiesOf } from '@storybook/vue'
import Vue from 'vue'
import Vuex from 'vuex'
import BatchList from './batchList'
import { batch } from './batch.stories.js'
import StoryRouter from 'storybook-vue-router'

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
  { ...batch, status: 'PENDING', link: 'b', id: 1, at: 1578133232378 - 10 },
  { ...batch, status: 'PENDING', link: 'c', id: 2, at: 1578133232378 - 100 }
]

storiesOf('BatchList', module)
  .addDecorator(StoryRouter())
  .add('default', () => {
    return {
      store: store,
      components: {
        'mt-batchList': BatchList
      },
      template: '<mt-batchList :limit="1"/></mt-batchList>'
    }
  })
  .add('two per page', () => {
    return {
      store: store,
      components: {
        'mt-batchList': BatchList
      },
      template: '<mt-batchList :limit="2"/></mt-batchList>'
    }
  })
  .add('no additional batch if additional batch are in the past', () => {
    return {
      props: {
        additionalBatches: {
          default: _ => {
            return [
              { version: 1, ...batches[0], status: 'PENDING' },
              { version: 1, ...batches[1] }
            ]
          }
        }
      },
      store: store,
      components: {
        'mt-batchList': BatchList
      },
      template: '<mt-batchList :limit="1" :additional-batches="additionalBatches"/></mt-batchList>'
    }
  })
  .add('additional batch if more recent than page 1', () => {
    const localBatches = batches.slice(0)
    const additionalBatches = [{ ...batch, id: 3, at: 1578133232378 + 10, link: 'additional', version: 1 }]
    let firstTime = true
    const store = new Vuex.Store({
      actions: {
        async getBatches (context, { offset, limit }) {
          if (offset === 0 && !firstTime && localBatches[0] !== additionalBatches[0]) {
            localBatches.unshift(...additionalBatches)
          }
          firstTime = false
          return {
            count: localBatches.length,
            items: localBatches.slice(offset, offset + limit)
          }
        }
      }
    })
    return {
      props: {
        additionalBatches: {
          default: _ => additionalBatches
        }
      },
      store: store,
      components: {
        'mt-batchList': BatchList
      },
      template: '<mt-batchList :limit="1" :additional-batches="additionalBatches"/></mt-batchList>'
    }
  })
