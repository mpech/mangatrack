<template>
  <div class="mangaChapters">
    <a :href="'#chap'+lastRead">
      <font-awesome-icon :icon="['fas', 'long-arrow-alt-down']"/>
      Scroll to last read (c{{lastRead}})
    </a>
    <table class="pure-table" :lastRead="lastRead">
      <thead>
        <th>Chapter</th>
        <th>from</th>
        <th>when</th>
        <th class="truckKun" title="mark as read">
          <div>
            <font-awesome-icon :icon="['fas', 'truck']"/>
          </div>
        </th>
    </thead>
    <tbody @mouseover="paintSelection" @click="select">
      <tr :id="'chap'+metaChapter.num" v-for="metaChapter in chapters" v-bind:key="metaChapter.num" :class="{read:metaChapter.num <= lastTracked}">
        <td>c{{metaChapter.num}}</td>
        <td>
          <a
            v-for="from in metaChapter.froms"
            v-bind:key="from.klass+'_'+metaChapter.num"
            :href="from.url"
            class="from"
            :class="from.klass"></a>
        </td>
        <td><time :updatedAt="metaChapter.at">{{humanDate(metaChapter.at)}}</time></td>
        <td title="mark as read up to there" @mouseleave="rollback" :data-num="metaChapter.num"></td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
.mangaChapters > a {
  display:block;
  margin-bottom: 1em;
}

.mangaChapters a.from {
  width: 1.5em;
  height: 1.5em;
  display: inline-block;
  margin-left: 0.5em;
  margin-right: 0.5em;
  background-size: cover;
}
.mangaChapters a.from:first-child {
  margin-left: 0px;
}
.mangaChapters a.from:last-child {
  margin-right: 0px;
}
.mangaChapters .from-mangakakalot {
  background-image: url('../assets/mangakakalot.png');
}
.mangaChapters .from-fanfox {
  background-image: url('../assets/fanfox.png');
}
.mangaChapters .from-manganelo {
  background-image: url('../assets/manganelo.png');
}
@media only screen and (max-width: 1024px) {
  .mangaView table {
    width: 100%
  }
}
.mangaChapters td:last-child {
  cursor: pointer;
}
.mangaChapters .truckKun svg {
  color: white;
  border-radius: 1em 1em;
  background-color: #209cee;
  padding: 0.3em 0.3em;
}

.mangaChapters .isekaied {
    background: #CCCCCC;
}
.mangaChapters .read {
    background: #CCCCCC;
}
.mangaChapters td:last-child:hover {
    cursor: pointer;
    background: #CCCCCC;
}
</style>
<script>
import moment from 'moment'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLongArrowAltDown, faTruck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faLongArrowAltDown)
library.add(faTruck)

const MangaChapters = {
  props: ['chapters', 'lastRead'],
  data () {
    return {
      oldTracked: this.lastRead,
      lastTracked: this.lastRead
    }
  },
  components: {
    'font-awesome-icon': FontAwesomeIcon
  },
  methods: {
    _ensureTd (e, fn) {
      if (e.target.nodeName !== 'TD') {
        return
      }
      const td = e.target
      const children = td.parentNode.children
      if (children[children.length - 1] !== td) {
        return
      }
      return fn(td)
    },
    rollback (e) {
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
      return moment(at).format('YY-MM-DD')
    }
  }
}

export default MangaChapters
</script>