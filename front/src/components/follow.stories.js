import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'

import Follow from './follow.vue'

export const methods = {
  onPinFollow: action('onPinFollow'),
  onArchiveFollow: action('onArchiveFollow')
}

storiesOf('Follow', module)
  .add('followed', () => {
    return {
      components: { Follow },
      template: '<Follow :followed="true" name="def" title="Test"/>',
      methods
    }
  })
  .add('default', () => {
    return {
      components: { Follow },
      template: '<Follow name="def" title="Test"/>',
      methods
    }
  })
