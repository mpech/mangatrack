import { storiesOf } from '@storybook/vue'
import StoryRouter from 'storybook-vue-router'
import Vue from 'vue'
import Vuex from 'vuex'
import Menu from './menu'

Vue.use(Vuex)

storiesOf('Menu', module)
  .addDecorator(StoryRouter())
  .add('no logged no admin', () => {
    const store = new Vuex.Store()

    return {
      store,
      components: { Menu },
      template: '<Menu/>'
    }
  })
  .add('logged admin', () => {
    const store = new Vuex.Store({
      getters: {
        accessToken () { return 'a' },
        isAdmin () { return true }
      }
    })

    return {
      store,
      components: { Menu },
      template: '<Menu/>'
    }
  })
