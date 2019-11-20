import Vue from './vue.esm.browser.min.js'
import { Grid } from './components/grid.js'
const Home = Vue.component('mt-home', {
  computed: {
    mangas () {
      return this.$store.state.mangas
    }
  },
  components: {
    'mt-grid': Grid
  },
  template: '<mt-grid :mangas="mangas" class="mt-grid"></mt-grid>',
  mounted () {
    if (!this.mangas.length) {
      return this.$store.dispatch('fetchMangas')
    }
  }
})
export { Home }
