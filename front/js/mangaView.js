import Vue from './vendors/vue.esm.browser.min.js'
import { routes } from './config.js'

const tpl = `
  <table class="pure-table" :lastRead="lastRead">
      <thead>
          <th>Chapter</th>
          <th>when</th>
          <th title="mark as read"><span class="truckkun">⛟</span></th>
      </thead>
      <tbody @mouseleave="rollback" @mouseover="paintSelection" @click="select">
          <tr v-for="chapter in chapters" v-bind:key="chapter.num" :class="{read:chapter.num <= lastTracked}">
              <td><a :href="chapter.url">c{{chapter.num}}</a></td>
              <td><time :updatedAt="chapter.at">{{humanDate(chapter.at)}}</time></td>
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
  computed: {
    lastTracked () {
      return this.lastRead
    }
  },
  methods: {
    _ensureTd (e, fn) {
      if (e.target.nodeName !== 'TD') {
        return
      }
      const td = e.target
      if (td.parentNode.children[2] !== td) {
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
    },
    humanDate (at) {
      return moment(at).format('YYYY-MM-DD')
    }
  },
  template: tpl
}

const MangaView = Vue.component('mt-mangaView', {
  data () {
    // assumes when getting details of a manga, manga is in the store
    return {
      chapters: [],
      mangaId: '',
      ready: false
    }
  },
  computed: {
    lastRead () {
      const m = this.$store.state.myMangas[this.mangaId]
      return typeof m !== 'undefined' ? m : -1
    }
  },
  components: {
    'mt-chapters': MangaChapters
  },
  template: `
    <div class="mangaView">
      <mt-chapters v-if="ready" :chapters="chapters" :lastRead="lastRead" @trackchapter="trackchapter"></mt-chapters>
    </div>
  `,
  methods: {
    trackchapter (num) {
      this.$store.dispatch('trackManga', { id: this.mangaId, num })
    }
  },
  mounted () {
    const dfds = []
    // fetch my chapter
    dfds.push(this.$store.dispatch('fetchMyMangas'))
    // fetch available chapters
    const url = routes.mangaDetail.replace('{{nameId}}', this.$route.params.nameId)
    dfds.push(axios.get(url).then(({ data }) => {
      this.mangaId = data.id
      this.chapters = data.chapters
    }))
    return Promise.all(dfds).then(_ => {
      this.ready = true
    })
  }
})

export { MangaView }
