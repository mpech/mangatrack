import Vue from './vue.esm.browser.min.js'
import { routes } from './config.js'

const tpl = `
  <table class="pure-table" :lastRead="lastRead">
      <thead>
          <th>Chapter</th>
          <th title="mark as read"><span class="truckkun">⛟</span></th>
      </thead>
      <tbody @mouseleave="rollback" @mouseover="paintSelection" @click="select">
          <tr v-for="chapter in chapters" v-bind:key="chapter.num" :class="{read:chapter.num <= lastTracked}">
              <td><a :href="chapter.url">c{{chapter.num}}</a></td>
              <td :data-num="chapter.num"></td>
          </tr>
      </tbody>
  </table>
`

const MangaChapters = {
  props: ['chapters', 'lastRead'],
  data () {
    return {
      oldTracked: this.lastRead,
      lastTracked: this.lastRead
    }
  },
  methods: {
    _ensureTd (e, fn) {
      if (e.target.nodeName !== 'TD') {
        return
      }
      const td = e.target
      if (td.parentNode.children[1] !== td) {
        return
      }
      return fn(td)
    },
    rollback (e) {
      if (e.target.nodeName === 'TD') { return }
      this.lastTracked = this.oldTracked
    },
    paintSelection (e) {
      this._ensureTd(e, td => {
        const num = parseFloat(td.getAttribute('data-num'))
        this.lastTracked = num
      })
    },
    select (e) {
      return this._ensureTd(e, td => {
        const num = parseFloat(td.getAttribute('data-num'))
        this.$emit('trackchapter', num)
        this.oldTracked = num
      })
    }
  },
  template: tpl
}

const MangaView = Vue.component('mt-mangaView', {
  data () {
    return {
      chapters: [],
      nameId: this.$route.params.nameId
    }
  },
  computed: {
    lastRead () {
      const m = this.$store.state.myMangas[this.nameId]
      return typeof m !== 'undefined' ? m : -1
    }
  },
  components: {
    'mt-chapters': MangaChapters
  },
  template: `
    <div class="mangaView">
      <mt-chapters :chapters="chapters" :lastRead="lastRead" @trackchapter="trackchapter"></mt-chapters>
    </div>
  `,
  methods: {
    trackchapter (num) {
      this.$store.dispatch('trackManga', { nameId: this.nameId, num })
    }
  },
  mounted () {
    // fetch available chapters
    const url = routes.chapters.replace('{{nameId}}', this.nameId)
    this.$store.dispatch('fetchMyMangas')
    return axios.get(url).then(({ data: { items } }) => {
      this.chapters = items
    })
  }
})

export { MangaView }
