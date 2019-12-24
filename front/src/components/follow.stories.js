import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'

import Follow from './follow.vue'

export const methods = {
  onFollow: action('onFollow'),
  onUnfollow: action('onUnfollow')
}

storiesOf('Follow', module)
  .add('followed', () => {
    return {
      components: { Follow },
      template: '<Follow :followed="true" name="def" title="Test" @unfollow="onUnfollow"/>',
      methods
    }
  })
  .add('default', () => {
    return {
      components: { Follow },
      template: '<Follow name="def" title="Test" @follow="onFollow"/>',
      methods
    }
  })
