<template>
  <div class="mt-grid">
    <div class="pure-g">
      <mt-card
        v-for="manga in followMangas"
        :key="manga.id"
        :card="manga"
        url="/manga">
      </mt-card>
    </div>
    <mt-pagination v-if="paginate && hasMore" @more="fetchMangas"></mt-pagination>
  </div>
</template>
<script>
import Vue from 'vue'
import Card from './card'
import MtPagination from './pagination'

const Grid = {
  props: {
    mangas: Array,
    myMangas: Object,
    paginate: {
      type: Boolean,
      default: true
    }
  },
  components: {
    'mt-card': Card,
    'mt-pagination': MtPagination
  },
  computed: {
    followMangas () {
      return this.mangas.map(m => {
        if (this.myMangas[m.id] && this.myMangas[m.id].state !== 'deleted') {
          Vue.set(m, 'followed', true)
          Vue.set(m, 'num', this.myMangas[m.id].num)
        } else {
          Vue.set(m, 'followed', false)
        }
        return m
      })
    },
    hasMore () {
      return !!this.$store.state.moreMangas.next
    }
  },
  methods: {
    fetchMangas () {
      return this.$store.dispatch('fetchMangas')
    }
  }
}
export default Grid
</script>