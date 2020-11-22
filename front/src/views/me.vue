<template>
  <div>
    <h1>Tracked mangas</h1>
    <h2>Updates</h2>
    <mt-grid :mangas="newMangas" :myMangas="myMangas" :paginate="false"></mt-grid>
    <h2>Up to date</h2>
    <mt-grid :mangas="upToDateMangas" :myMangas="myMangas" :paginate="false"></mt-grid>
  </div>
</template>

<script>
import Grid from '../components/grid'

const Me = {
  computed: {
    myMangas () {
      return this.$store.state.myMangas
    },
    newMangas () {
      return this.myPopulatedMangas
        .filter(x => x.hasNew)
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    upToDateMangas () {
      return this.myPopulatedMangas
        .filter(x => !x.hasNew)
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    myPopulatedMangas () {
      return this.$store.state.myPopulatedMangas.map(x => {
        x.hasNew = this.myMangas[x.id].num < (x.lastChap && x.lastChap.num)
        return x
      })
    }
  },
  components: {
    'mt-grid': Grid
  },
  async mounted () {
    if (this.$store.getters.accessToken) {
      // usecase: be on mobile and browser
      // mobile idle. browser updates
      // on mobile, when refreshing page, still logged but want to get browser updates
      await this.$store.dispatch('sync', { up: false })
    }
    // we don't directly populate on myMangas because life duration is not the same
    // myMangas can be fetched once, while myPopulated should always be fetched
    if (!this.myPopulatedMangas.length) {
      return this.$store.dispatch('fetchMyPopulatedMangas')
    }
  }
}
export default Me
</script>