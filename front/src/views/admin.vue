<template>
  <div v-if="this.$store.getters.isAdmin">
    <h1>Admin pannel</h1>
    <mt-link-importer @importLink="addBatch"/>
    <mt-batch-poller :ids="batchIds" @change="batchDone"/>
    <mt-batch-list :limit="10" :additional-batches="Object.values(batches)"/>
  </div>
  <div v-else>
    You may have been unlogged. Relog yourself
  </div>
</template>
<style>
  .batchList {
    margin-top: 1em;
  }
</style>
<script>
import LinkImporter from '../components/linkImporter'
import BatchList from '../components/batchList'
import BatchPoller from '../components/batchPoller'

const Admin = {
  data () {
    return {
      batches: {}
    }
  },
  computed: {
    batchIds () {
      return Object.keys(this.batches)
    }
  },
  components: {
    'mt-link-importer': LinkImporter,
    'mt-batch-poller': BatchPoller,
    'mt-batch-list': BatchList
  },
  methods: {
    async addBatch ({ link, refreshDescription, refreshThumb }) {
      const batch = await this.$store.dispatch('importLink', { link, refreshDescription, refreshThumb })
      this.$set(this.batches, batch.id, batch)
    },
    batchDone (batch) {
      this.$set(this.batches, batch.id, batch)
    }
  }
}
export default Admin
</script>