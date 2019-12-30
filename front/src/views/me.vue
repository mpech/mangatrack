<template>
  <div>
    <h1>Tracked mangas</h1>
    <mt-grid :mangas="myPopulatedMangas" :myMangas="myMangas" class="mt-grid"></mt-grid>
  </div>
</template>

<script>
import Grid from '../components/grid'

const Me = {
  computed: {
    myMangas () {
      return this.$store.state.myMangas
    },
    myPopulatedMangas () {
      this.$store.state.myPopulatedMangas.forEach(x => {
        x.hasNew = this.myMangas[x.id] < (x.lastChap && x.lastChap.num)
      })
      return this.$store.state.myPopulatedMangas.sort((a, b) => {
        if (a.hasNew !== b.hasNew) {
          return b.hasNew - a.hasNew
        }
        return a.name.localeCompare(b.name)
      })
    }
  },
  components: {
    'mt-grid': Grid
  },
  mounted () {
    // we don't directly populate on myMangas because life duration is not the same
    // myMangas can be fetched once, while myPopulated should always be fetched
    if (!this.myPopulatedMangas.length) {
      return this.$store.dispatch('fetchMyPopulatedMangas')
    }
  }
}
export default Me
</script>