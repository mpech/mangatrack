<template>
  <div>
    <mt-filter-form></mt-filter-form>
    <mt-grid :mangas="mangas" :myMangas="myMangas" :more="more"></mt-grid>
  </div>
</template>

<script>
import Grid from '../components/grid'
import FilterForm from '../components/filterForm'

const Home = {
  computed: {
    mangas () {
      return this.$store.state.mangas
    },
    myMangas () {
      return this.$store.state.myMangas
    }
  },
  components: {
    'mt-grid': Grid,
    'mt-filter-form': FilterForm
  },
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
}
export default Home
</script>