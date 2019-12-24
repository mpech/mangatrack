<template>
  <table class="pure-table" :lastRead="lastRead">
      <thead>
          <th>Chapter</th>
          <th>from</th>
          <th>when</th>
          <th title="mark as read"><span class="truckkun">⛟</span></th>
      </thead>
      <tbody @mouseover="paintSelection" @click="select">
          <tr v-for="metaChapter in chapters" v-bind:key="metaChapter.num" :class="{read:metaChapter.num <= lastTracked}">
              <td>c{{metaChapter.num}}</td>
              <td>
                <a v-for="from in metaChapter.froms" v-bind:key="metaChapter.num" :href="from.url" class="from" :class="from.klass"></a>
              </td>
              <td><time :updatedAt="metaChapter.at">{{humanDate(metaChapter.at)}}</time></td>
              <td @mouseleave="rollback" :data-num="metaChapter.num"></td>
          </tr>
      </tbody>
  </table>
</template>


<script>
import moment from 'moment'

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
      return moment(at).format('YYYY-MM-DD')
    }
  }
}

export default MangaChapters
</script>