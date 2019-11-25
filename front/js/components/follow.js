import Vue from '../vendors/vue.esm.browser.min.js'

const tpl = `
    <span @click="onclick" :class="{followed:followed, 'mt-follow':1}" :title="title"><a href="#">♥</a></span>
`

var Follow = Vue.component('mt_follow', {
  props: ['followed', 'name'],
  computed: {
    title () {
      if (this.followed) {
        return 'Untrack ' + this.name
      }
      return 'Track ' + this.name
    }
  },
  template: tpl,
  methods: {
    onclick (e) {
      e.preventDefault()
      return this.$emit(!this.followed ? 'follow' : 'unfollow')
    }
  }
})
export { Follow }
