import Vue from '../vendors/vue.esm.browser.min.js'
import { Card } from './card.js'

const MtPagination = {
  template: `
<div class="mt-pagination">
    <a @click="more" class="pure-button" href="#">Moar</a>
</div>
`,
  methods: {
    more (e) {
      e.preventDefault()
      return this.$store.dispatch('fetchMangas')
    }
  }
}

const tpl = `
<div>
    <div class="pure-g">
        <mt_card
          v-for="manga in followMangas"
          :key="manga.id"
          :card="manga"
          url="/manga">
        </mt_card>
    </div>
    <mt-pagination></mt-pagination>
</div>
`
const Grid = Vue.component('mt-grid', {
  props: ['mangas', 'myMangas'],
  components: {
    'mt-card': Card,
    'mt-pagination': MtPagination
  },
  computed: {
    followMangas () {
      return this.mangas.map(m => {
        Vue.set(m, 'followed', typeof (this.myMangas[m.id]) !== 'undefined')
        Vue.set(m, 'num', this.myMangas[m.id])
        return m
      })
    }
  },
  template: tpl
})
export { Grid }
