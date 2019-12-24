<template>
  <div class="mangaView">
    <mt-chapters v-if="ready" :chapters="chapters" :lastRead="lastRead" @trackchapter="trackchapter"></mt-chapters>
  </div>
</template>

<script>
import { routes } from '../config.js'
import MangaChapters from '../components/mangaChapters'
export default {
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
    const nameId = this.$route.params.nameId
    dfds.push(this.$store.dispatch('fetchMangaDetail', { nameId }).then(({ data }) => {
      this.mangaId = data.id
      const numToMetaChapter = {}
      data.chapters.sort((a, b) => a.from.localeCompare(b.from)).forEach(({ from, chapters }) => {
        chapters.forEach(chap => {
          numToMetaChapter[chap.num] = numToMetaChapter[chap.num] || { num: chap.num, froms: [], at: 1e15 }
          const metaChapter = numToMetaChapter[chap.num]
          metaChapter.at = Math.min(metaChapter.at, chap.at)
          metaChapter.froms.push(chap)
          chap.klass = `from-${from}`
        })
      })
      this.chapters = Object.values(numToMetaChapter).sort((a, b) => b.num - a.num)
    }))
    return Promise.all(dfds).then(_ => {
      this.ready = true
    })
  }
}

</script>