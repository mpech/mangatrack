<template>
  <div v-if="this.$store.getters.isAdmin">
    <h1>Admin pannel</h1>
    <mt-link-importer @importLink="addBatch"/>
    <mt-batch-poller :ids="batchIds" @change="batchDone"/>
    <mt-batch-list :limit="10" :key="reloadId"/>
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
      batches: [],
      reloadId: 0
    }
  },
  computed: {
    batchIds () {
      return this.batches.map(b => b.id)
    }
  },
  components: {
    'mt-link-importer': LinkImporter,
    'mt-batch-poller': BatchPoller,
    'mt-batch-list': BatchList
  },
  methods: {
    async addBatch (link) {
      const batch = await this.$store.dispatch('importLink', { link })
      this.batches.push(batch)
      this.reloadId++
    },
    async batchDone () {
      this.reloadId++
    }
  }
}
export default Admin
</script>