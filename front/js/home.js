import Vue from './vendors/vue.esm.browser.min.js'
import { Grid } from './components/grid.js'
import { Autocomplete } from './components/autocomplete.js'

const tpl = `
<div>
<mt-autocomplete></mt-autocomplete>
<mt-grid :mangas="mangas" :myMangas="myMangas" :more="more" class="mt-grid"></mt-grid>
</div>
`

const Home = Vue.component('mt-home', {
  computed: {
    mangas () {
      return this.$store.state.mangas
    },
    myMangas () {
      return this.$store.state.myMangas
    }
  },
  components: {
    'mt-autocomplete': Autocomplete,
    'mt-grid': Grid
  },
  template: tpl,
  methods: {
    more () {
      return this.$store.dispatch('fetchMangas')
    }
  },
  mounted () {
    if (!this.mangas.length) {
      return this.$store.dispatch('fetchMangas')
    }
  }
})
export { Home }
