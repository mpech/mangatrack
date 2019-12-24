<template>
  <div>
    <div class="pure-g">
      <mt-card
        v-for="manga in followMangas"
        :key="manga.id"
        :card="manga"
        url="/manga">
      </mt-card>
    </div>
    <mt-pagination></mt-pagination>
  </div>
</template>
<script>
import Vue from 'vue'
import Card from './card'
import MtPagination from './pagination'

const Grid = {
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
  }
}
export default Grid
</script>