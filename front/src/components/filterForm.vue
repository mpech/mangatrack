<template>
  <div id="filterForm">
    <div>
      <input placeholder="manga name" type="text" name="q" @keyup='onKeyUp'></input>
      <input placeholder="min chapters" type="text" name="min" pattern="[0-9]*" @change='onMinChange'></input>
    </div>
  </div>
</template>

<style scoped>
#filterForm input {
  background: inherit;
  border: none;
  padding:12px 12px 12px 48px;
  box-sizing: border-box;
  display: inline-box;
  margin-bottom: 2px;
}
#filterForm input {
  background-color: #fff;
  outline: none;
  box-shadow: 0 2px 2px rgba(0,0,0,.16);
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
<script>
import Vue from 'vue'
import debounce from 'debounce'

const FilterForm = {
  data () {
    return {
      q: '',
      min: 0
    }
  },
  methods: {
    onMinChange (e) {
      this.min = parseInt(e.target.value, 10) || 0
      return this.$store.dispatch('fetchMangas', { q: this.q, minChapters: this.min, offset: 0 })
    },
    wait: debounce((q, cb) => q.length >= 3 && cb(), 1000),
    onKeyUp (e) {
      this.q = e.target.value
      this.wait(this.q, () => {
        this.$store.dispatch('fetchMangas', {
          q: this.q, minChapters: this.min, offset: 0
        })
      })
    }
  }
}
export default FilterForm

</script>