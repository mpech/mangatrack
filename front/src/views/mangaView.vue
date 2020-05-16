<template>
  <div class="mangaView">
    <h1>{{ manga.name }}</h1>
    <div class="pure-g">
      <div class="pure-u-5-5 pure-u-lg-1-5">
        <figure>
          <img :src="manga.thumbUrl" @error="refreshPicture"/>
        </figure>
      </div>
      <div class="pure-u-5-5 pure-u-lg-4-5">
        <div v-if="manga.description.content" class="description">
          <h3>Description</h3>
          <blockquote>
            {{ description }}
            <footer>
              <cite>{{ manga.description.from }}</cite>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
    <mt-chapters v-if="ready" :chapters="chapters" :lastRead="lastRead" @trackchapter="trackchapter"></mt-chapters>
  </div>
</template>
<style scoped>
.mangaView figure{
    padding:0;
    margin:0;
    width:100%;
    height:15em;
}
.mangaView figure img{
    height:100%;
    width:100%;
    object-fit: cover;
}
.mangaView .pure-g > div {
  box-sizing: border-box;
  padding: 1em;
}
.mangaView .description-from {
  text-align:right;
}
.mangaView h3 {
  margin-top: 0;
}
.mangaView .pure-g > div {
  margin-bottom: 2em;
}
</style>
<script>
import { routes } from '../config.js'
import MangaChapters from '../components/mangaChapters'
export default {
  data () {
    // assumes when getting details of a manga, manga is in the store
    return {
      chapters: [],
      ready: false,
      manga: { description: {} }
    }
  },
  computed: {
    lastRead () {
      const m = this.$store.state.myMangas[this.manga.id]
      return typeof m !== 'undefined' ? m : -1
    },
    description () {
      if (!this.manga || !this.manga.description || !this.manga.description.content) {
        return ''
      }
      // decode htmlentities but let vue escape any html stuff
      const txt = document.createElement('textarea')
      txt.innerHTML = this.manga.description.content
      return txt.value
    }
  },
  components: {
    'mt-chapters': MangaChapters
  },
  methods: {
    trackchapter (num) {
      this.$store.dispatch('trackManga', { id: this.manga.id, num })
    },
    async refreshPicture () {
      const batch = await this.$store.dispatch('refreshManga', { id: this.manga.id, refreshThumb: true })
      if (batch.status === 'OK') {
        const { data: { chapters, ...manga } } = await this.$store.dispatch('fetchMangaDetail',
          this.$route.params.nameId)
        this.manga = manga
      }
    }
  },
  mounted () {
    const dfds = []
    // fetch my chapter
    dfds.push(this.$store.dispatch('fetchMyMangas'))
    // fetch available chapters
    const nameId = this.$route.params.nameId
    dfds.push(this.$store.dispatch('fetchMangaDetail', { nameId }).then(({ data: { chapters, ...manga } }) => {
      this.manga = manga
      const numToMetaChapter = {}
      chapters.sort((a, b) => a.from.localeCompare(b.from)).forEach(({ from, chapters }) => {
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