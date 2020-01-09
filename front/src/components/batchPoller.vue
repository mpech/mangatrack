<template>
  <div>
  </div>
</template>
<script>
const BatchPoller = {
  props: {
    'notification-group': {
      type: String,
      default: _ => 'batch'
    },
    ids: {
      type: Array,
      default: _ => []
    },
    'polling-delay': {
      type: Number,
      default: _ => 3000
    }
  },
  data () {
    return {
      timeout: -1,
      polling: false,
      doneIds: {}
    }
  },
  computed: {
    batchIds () {
      const res = this.ids.filter(id => {
        // a bit sad not to use a Set
        // but reactivity not yet supported
        // https://stackoverflow.com/questions/37130105/does-vue-support-reactivity-on-map-and-set-data-types
        return !this.doneIds[id]
      })
      return res
    }
  },
  watch: {
    ids (val, old) {
      return this.poll()
    }
  },
  methods: {
    wait () {
      return new Promise((resolve, reject) => {
        this.timeout = setTimeout(resolve, this.pollingDelay)
      })
    },
    async poll () {
      if (this.polling || this.batchIds.length === 0) {
        return
      }
      this.polling = true
      while (this.polling) {
        const res = await this.refresh()
        if (res) {
          return this.stopPolling()
        }
        await this.wait()
      }
    },
    handleBatch (b) {
      if (b.status === 'OK' || b.status === 'KO') {
        this.$notify({
          group: 'batch',
          title: 'batch update',
          text: `${b.status} ${b.link}`
        })
        //remove the batch from our ids
        this.$set(this.doneIds, b.id, true)
      }
      return b.status
    },
    /**
     * returns true if everything fulfilled
     */
    async refresh () {
      const { items: batches } = await this.$store.dispatch('getAllBatchesById', this.batchIds)
      const statuses = batches.map(b => {
        const status = this.handleBatch(b)
        if (status !== 'PENDING') {
          this.$emit('change', b)
        }
        return status
      })
      return statuses.every(s => s !== 'PENDING')
    },
    stopPolling () {
      this.polling = false
      clearTimeout(this.timeout)
    }
  },
  async mounted () {
    return this.poll()
  },
  async beforeDestroy () {
    return this.stopPolling()
  }
}
export default BatchPoller
</script>
