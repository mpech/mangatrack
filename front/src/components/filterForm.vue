<template>
  <div id="filterForm">
    <div>
      <input placeholder="min chapters" type="text" pattern="[0-9]*" @change='onChange'></input>
      <mt-autocomplete class="autocomplete" :onQuery='onQuery'></mt-autocomplete>
    </div>
  </div>
</template>

<style scoped>
#filterForm input:first-child {
  background: inherit;
  border: none;
  padding:12px 12px 12px 48px;
  box-sizing: border-box;
  display: inline-box;
  margin-bottom: 2px;
}
#filterForm input:first-child:focus{
  background-color: #fff;
  outline: none;
  box-shadow: 0 2px 2px rgba(0,0,0,.16);
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
<script>
import Vue from 'vue'
import Autocomplete from '../components/autocomplete'

const FilterForm = {
  components: {
    'mt-autocomplete': Autocomplete
  },
  data () {
    return {
      q: '',
      min: 0
    }
  },
  methods: {
    onChange (e) {
      this.min = parseInt(e.target.value, 10) || 0
      return this.$store.dispatch('filterMangas', { q: this.q, minChapters: this.min })
    },
    async onQuery (q) {
      this.q = q
      if (this.q.length < 3) { return { items: [] } }
      return this.$store.dispatch('searchMangas', { q: this.q, minChapters: this.min })
    }
  }
}
export default FilterForm

</script>