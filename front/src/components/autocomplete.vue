<template>
  <div>
  <autocomplete
    :search="search"
    :get-result-value="getResultValue"
    placeholder="Search mangas"
    aria-label="Search mangas"
    @submit="onSubmit"
    debounceTime="300"
  />
  </div>
</template>
<script>
import Vue from 'vue'
import TrevoreyreAuto from '@trevoreyre/autocomplete-vue'

const Autocomplete = {
  props: ['onQuery'],
  data () {
    return {
      _q: ''
    }
  },
  components: {
    autocomplete: TrevoreyreAuto
  },
  methods: {
    async search (q) {
      this._q = q
      const res = await this.onQuery(q)
      return res.items
    },
    getResultValue (result) {
      return result.name
    },
    onSubmit (e) {
      if (e) {
        const nameId = e.nameId
        this.$router.push(`/manga/${nameId}`)
      } else {
        const q = this._q
        this.$store.dispatch('filterMangas', { q })
      }
    }
  }
}
export default Autocomplete

</script>