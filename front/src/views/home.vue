<template>
  <div>
    <mt-autocomplete></mt-autocomplete>
    <mt-grid :mangas="mangas" :myMangas="myMangas" :more="more" class="mt-grid"></mt-grid>
  </div>
</template>

<script>
import Grid from '../components/grid'
import Autocomplete from '../components/autocomplete'

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
    'mt-autocomplete': Autocomplete,
    'mt-grid': Grid
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