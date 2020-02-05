import { storiesOf } from '@storybook/vue'
import StoryRouter from 'storybook-vue-router'

import MangaChapters from './mangaChapters'

storiesOf('MangaChapters', module)
  .addDecorator(StoryRouter())
  .add('scroll to chap0 if no lastRead', () => {
    return {
      data () {
        return {
          chapters: [
            {
              num: 2
            }, {
              num: 0
            }
          ]
        }
      },
      components: { MangaChapters },
      template: '<MangaChapters :chapters="chapters" :lastRead="-1" />'
    }
  })
  .add('scroll to lastRead', () => {
    return {
      data () {
        return {
          chapters: [
            {
              num: 2
            }, {
              num: 0
            }
          ]
        }
      },
      components: { MangaChapters },
      template: '<MangaChapters :chapters="chapters" :lastRead="2" />'
    }
  })
  .add('no scroll if no chaps, no table display either', () => {
    return {
      data () {
        return {
          chapters: []
        }
      },
      components: { MangaChapters },
      template: '<MangaChapters :chapters="chapters" />'
    }
  })
