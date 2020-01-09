import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'
import Vue from 'vue'
import Vuex from 'vuex'
import StoryRouter from 'storybook-vue-router'
import MangaView from './mangaView'

Vue.use(Vuex)

storiesOf('MangaView', module)
  .addDecorator(StoryRouter())
  .add('default', () => {
    const store = new Vuex.Store({
      state: {
        myMangas: {}
      },
      actions: {
        async fetchMangaDetail (context, { offset, limit }) {
          return {
            data: {
              id: '0'.repeat(24),
              name: 'Cultivation Chat Group',
              thumbUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7d/Lenna_%28test_image%29.png',
              description: {
                content: 'One day, Song Shuhang was suddenly added to a chat',
                from: 'manganelo'
              },
              chapters: [
                {
                  from: 'manganelo',
                  chapters: [{ num: 1, url: 'xx', at: 1578509397314 }]
                }
              ]
            }
          }
        },
        fetchMyMangas: action('fetchMyMangas')
      }
    })

    return {
      store: store,
      components: {
        'mt-mangaView': MangaView
      },
      template: '<mt-mangaView/>'
    }
  })
  .add('without description', () => {
    const store = new Vuex.Store({
      state: {
        myMangas: {}
      },
      actions: {
        async fetchMangaDetail (context, { offset, limit }) {
          return {
            data: {
              id: '0'.repeat(24),
              name: 'Cultivation Chat Group',
              thumbUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7d/Lenna_%28test_image%29.png',
              chapters: [],
              description: {
                content: '',
                from: ''
              }
            }
          }
        },
        fetchMyMangas: action('fetchMyMangas')
      }
    })

    return {
      store: store,
      components: {
        'mt-mangaView': MangaView
      },
      template: '<mt-mangaView/>'
    }
  })
  .add('html escaped but htmlentities decoded', () => {
    const store = new Vuex.Store({
      state: {
        myMangas: {}
      },
      actions: {
        async fetchMangaDetail (context, { offset, limit }) {
          return {
            data: {
              id: '0'.repeat(24),
              name: 'Cultivation Chat Group',
              thumbUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7d/Lenna_%28test_image%29.png',
              chapters: [],
              description: {
                content: 'each other &lsquo;Fellow Daoist&rsquo; and had &lt;strong&gt; brr &lt;/strong&gt; <strong>dos</strong>',
                from: ''
              }
            }
          }
        },
        fetchMyMangas: action('fetchMyMangas')
      }
    })

    return {
      store: store,
      components: {
        'mt-mangaView': MangaView
      },
      template: '<mt-mangaView/>'
    }
  })
