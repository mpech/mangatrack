import Vue from '../vue.esm.browser.min.js'
import { Card } from './card.js'

(function mtPagination (Vue) {
  const tpl = `
<div class="mt-pagination">
    <a class="pure-button" href="#">Moar</a>
</div>
`
  return Vue.component('mt-pagination', {
    template: tpl,
    mounted () {
      this.$el.querySelector('a').onclick = e => {
        this.$store.dispatch('fetchMangas')
        e.preventDefault()
      }
    }
  })
})(Vue);

(function mtFilters (Vue) {
  const tpl = `
<div>
    filters
</div>
`
  return Vue.component('mt-filters', {
    template: tpl
  })
})(Vue)

const tpl = `
<div>
    <!--<mt-filters></mt-filters>-->
    <div class="pure-g">
        <mt_card v-for="manga in mangas" v-bind:key="manga.nameId" v-bind:card="manga" url="/manga"></mt_card>
    </div>
    <mt-pagination></mt-pagination>
</div>
`
const Grid = Vue.component('mt-grid', {
  props: ['mangas'],
  components: {
    'mt-card': Card
  },
  template: tpl
})
export { Grid }
