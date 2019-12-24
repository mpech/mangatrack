import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'
import StoryRouter from 'storybook-vue-router'

import Vue from 'vue'
import Vuex from 'vuex'

import Card from './card'
Vue.use(Vuex)
export const store = new Vuex.Store({
  state: {},
  actions: {
    trackManga (context, id) {
      action('trackManga')(id)
    }
  }
})
export const methods = {}

export const cardData = {
  card: {
    nameId: 'nid',
    name: 'some name',
    thumbUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7d/Lenna_%28test_image%29.png',
    lastChap: {
      num: 2,
      url: 'lastchapurl',
      at: 1577206158382
    }
  },
  url: 'xx'
}
storiesOf('Card', module)
  .addDecorator(StoryRouter())
  .add('default', () => {
    return {
      store,
      components: { Card },
      props: {
        card: {
          default: _ => ({ ...cardData.card })
        },
        url: {
          default: cardData.url
        }
      },
      template: '<Card :card="card" :url="url"/>',
      methods
    }
  })
