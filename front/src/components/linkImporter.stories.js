import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'
import LinkImporter from './linkImporter'

storiesOf('LinkImporter', module)
  .add('default', () => {
    return {
      components: {
        'mt-linkImporter': LinkImporter
      },
      template: '<mt-linkImporter @importLink="importLink"/>',
      methods: {
        importLink: function (body) {
          action('ev-importLink')(body)
        }
      }
    }
  })
