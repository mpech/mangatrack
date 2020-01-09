import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'
import Vue from 'vue'
import Vuex from 'vuex'
import BatchPoller from './batchPoller.vue'
import { batch } from './batch.stories.js'

Vue.use({
  install (Vue) {
    Vue.prototype.$notify = x => action('notify-batch')(x.text)
  }
})
Vue.use(Vuex)

const store = new Vuex.Store({
  actions: {
    async getAllBatchesById (context, ids) {
      action('store-getAllBatchesById')(ids)
      return { items: batches.filter(b => ids.includes(b.id)) }
    }
  }
})

export const batches = [
  { ...batch, id: '0', status: 'OK' },
  { ...batch, status: 'PENDING', link: 'c', id: '1' }
]

storiesOf('BatchPoller', module)
  .add('should not notify (pending)', () => {
    return {
      store,
      props: {
        ids: {
          default: _ => ['1']
        }
      },
      components: {
        'mt-batch-poller': BatchPoller
      },
      template: '<mt-batch-poller :ids="ids"/>'
    }
  })
  .add('should not notify shortDelayed', () => {
    return {
      store,
      props: {
        ids: {
          default: _ => ['1']
        },
        pollingDelay: {
          default: _ => 1000
        }
      },
      components: {
        'mt-batch-poller': BatchPoller
      },
      template: '<mt-batch-poller :ids="ids" :polling-delay="pollingDelay"/>'
    }
  })

  .add('should notify OK', () => {
    return {
      store,
      props: {
        ids: {
          default: _ => ['0']
        }
      },
      components: {
        'mt-batch-poller': BatchPoller
      },
      template: '<mt-batch-poller :ids="ids"/>'
    }
  })
