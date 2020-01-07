import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'
import Batch from './batch'

export const batch = {
  id: 'a',
  link: 'https://mangakakalot.com/manga/versatile_mage',
  at: 1578133232378,
  status: 'OK'
}

storiesOf('Batch', module)
  .add('at, link, status', () => {
    return {
      props: {
        batch: {
          default: _ => batch
        },
        fieldOrder: {
          default: _ => ['at', 'link', 'status'] 
        }
      },
      components: {
        'mt-batch': Batch
      },
      template: '<table class="pure-table"><mt-batch :batch="this.batch" :fieldOrder="fieldOrder"/></table>',
    }
  })
  .add('link, status, at', () => {
    return {
      props: {
        batch: {
          default: _ => batch
        },
        fieldOrder: {
          default: _ => ['link', 'status', 'at'] 
        }
      },
      components: {
        'mt-batch': Batch
      },
      template: '<table class="pure-table"><mt-batch :batch="this.batch" :fieldOrder="fieldOrder"/></table>',
    }
  })