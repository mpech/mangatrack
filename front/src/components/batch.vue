<template>
  <tr :class="{ live }">
    <td v-for="[k,v] in fields">
      <template v-if="k !== 'mangaId'">{{v}}</template>
      <template v-else>
        <template v-if="v">
          <router-link :to="'/manga/' + v">voir</router-link>
        </template>
      </template>
    </td>
  </tr>
</template>
<style scoped>
.live {
  background: #ddd;
}
</style>
<script>
import moment from 'moment'

const Batch = {
  props: {
    batch: Object,
    live: Boolean,
    fieldOrder: {
      validator (v) {
        const keys = new Set(['link', 'at', 'status', 'mangaId'])
        return Array.isArray(v) && v.every(x => keys.has(x))
      } 
    }
  },
  data () {
    return {
      fields: this.fieldOrder.map(fieldName => {
        const v = this.batch[fieldName]
        if (fieldName === 'at') {
          return [fieldName, this.humanDate(v)]
        }
        return [fieldName, v]
      })
    }
  },
  methods: {
    humanDate (at) {
      let sinceDate = moment(at).fromNow()
      sinceDate = sinceDate.replace('minutes', 'min')
      sinceDate = sinceDate.replace('seconds', 'sec')
      return sinceDate
    }
  }
}
export default Batch
</script>
