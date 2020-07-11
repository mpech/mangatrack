<template>
  <div id="filterForm">
    <div>
      <input placeholder="manga name" type="text" name="q" @keyup='onKeyUp'></input>
      <input placeholder="min chapters" type="text" name="min" pattern="[0-9]*" @keyup='onKeyUp'></input>
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
const defaultQ = q => q.length >= 3 ? q : undefined
const myDebounce = debounce((q, min, cb) => (defaultQ(q) || q.length === 0 || min) && cb(), 1000)
const FilterForm = {
  data () {
    return {
      q: '',
      min: ''
    }
  },
  methods: {
    fetch () {
      return this.$store.dispatch('fetchMangas', {
        q: defaultQ(this.q),
        minChapters: parseInt(this.min, 10) || 0,
        offset: 0
      })
    },
    onKeyUp (e) {
      this[e.target.name] = e.target.value
      myDebounce(this.q, this.min, () => this.fetch())
    }
  }
}
export default FilterForm

</script>