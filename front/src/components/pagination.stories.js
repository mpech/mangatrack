import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'
import StoryRouter from 'storybook-vue-router'

import Pagination from './pagination'

export const methods = {
  more: action('more')
}

storiesOf('Pagination', module)
  .addDecorator(StoryRouter())
  .add('default', () => {
    return {
      components: { Pagination },
      template: '<Pagination @more="more"/>',
      methods
    }
  })
