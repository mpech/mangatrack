<template>
  <tr :class="{ live }">
    <td v-for="v in fields">{{v}}</td> 
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
        const keys = new Set(['link', 'at', 'status'])
        return Array.isArray(v) && v.every(x => keys.has(x))
      } 
    }
  },
  data () {
    return {
      fields: this.fieldOrder.map(fieldName => {
        if (fieldName === 'at') {
          return this.humanDate(this.batch[fieldName])
        }
        return this.batch[fieldName]
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
