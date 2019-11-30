import Vue from './vendors/vue.esm.browser.min.js'
import { Grid } from './components/grid.js'
const tpl = `
'<div>
<h1>Tracked mangas</h1>
<mt-grid :mangas="myPopulatedMangas" :myMangas="myMangas" class="mt-grid"></mt-grid>
</div>'
`
const Me = Vue.component('mt-me', {
  computed: {
    myMangas () {
      return this.$store.state.myPopulatedMangas.reduce((acc, x) => {
        acc[x.nameId] = x.num
        return acc
      }, {})
    },
    myPopulatedMangas () {
      return this.$store.state.myPopulatedMangas
    }
  },
  components: {
    'mt-grid': Grid
  },
  template: tpl,
  mounted () {
    // we don't directly populate on myMangas because life duration is not the same
    // myMangas can be fetched once, while myPopulated should always be fetched
    if (!this.myPopulatedMangas.length) {
      return this.$store.dispatch('fetchMyPopulatedMangas')
    }
  }
})
export { Me }
