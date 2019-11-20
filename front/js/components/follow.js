import Vue from '../vue.esm.browser.min.js'

const tpl = `
    <span :class="{followed:followed, 'mt-follow':1}" :title="title"><a href="#">♥</a></span>
`

var Follow = Vue.component('mt_follow', {
  props: ['nameId', 'followed', 'name'],
  computed: {
    title () {
      if (this.followed) {
        return 'Untrack ' + this.name
      }
      return 'Track ' + this.name
    }
  },
  template: tpl,
  mounted () {
    this.$el.onclick = e => {
      e.preventDefault()
      if (!this.followed) {
        return this.$store.dispatch('trackManga', { nameId: this.nameId })
      }
      return this.$store.dispatch('untrackManga', { nameId: this.nameId })
    }
  }
})
export { Follow }
