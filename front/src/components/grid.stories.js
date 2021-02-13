import { storiesOf } from '@storybook/vue'
import StoryRouter from 'storybook-vue-router'

import Vue from 'vue'
import Vuex from 'vuex'

import Grid from './grid'
import { cardData } from './card.stories.js'
Vue.use(Vuex)

const defaultStore = new Vuex.Store({
  state: {
    moreMangas: {
      next: 'a'
    }
  }
})

const noPaginationStore = new Vuex.Store({
  state: {
    moreMangas: {}
  }
})

const mangas = [
  { ...cardData.card, id: 'a' },
  { ...cardData.card, id: 'b', name: 'other' }
]

const myMangas = {
  a: { updatedAt: 1, num: 1, state: 'write' }
}

storiesOf('Grid', module)
  .addDecorator(StoryRouter())
  .add('default', () => {
    return {
      store: defaultStore,
      props: {
        mangas: {
          default: _ => mangas.slice(0)
        },
        myMangas: {
          default: _ => ({ ...myMangas })
        }
      },
      components: { Grid },
      template: '<Grid :mangas="mangas" :myMangas="myMangas" />'
    }
  })
  .add('no pagination (no more)', () => {
    return {
      store: noPaginationStore,
      props: {
        mangas: {
          default: _ => mangas.slice(0)
        },
        myMangas: {
          default: _ => ({})
        }
      },
      components: { Grid },
      template: '<Grid :mangas="mangas" :myMangas="myMangas" />'
    }
  })
  .add('no pagination (deactivated)', () => {
    return {
      store: noPaginationStore,
      props: {
        mangas: {
          default: _ => mangas.slice(0)
        },
        myMangas: {
          default: _ => ({ ...myMangas })
        }
      },
      components: { Grid },
      template: '<Grid :mangas="mangas" :myMangas="myMangas" :paginate="false"/>'
    }
  })
