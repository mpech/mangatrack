<template>
  <div class="batchList">
    <div v-if="this.newBatches.length">
      New items ({{this.newBatches.length}}) <button @click="loadPage(1)">Reload</button>
    </div>
    <table class="pure-table">
      <thead>
        <tr>
          <th>status</th>
          <th>link</th>
          <th>at</th>
        </tr>
      </thead>
      <tbody>
        <mt-batch 
          v-for="batch in liveBatches"
          :key="batch.id+'_'+batch.version"
          :batch="batch"
          :live="batch.live"
          :fieldOrder="['status', 'link', 'at']"
        />
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">
            <paginate
              :page-count="pageCount"
              :click-handler="loadPage"
              prev-text="Prev"
              next-text="Next"
              container-class="pagination"
            ></paginate>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
<style>
.pagination {
  display:inline-box;
  text-align:center;
}
.pagination li {
  display:inline;
}
.pagination a {
  padding: 8px 16px;
  border: 1px solid #ddd;
}
.pagination li:first-child a {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.pagination li:last-child a {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
.pagination a:hover {
  background: #ddd;
}
.pagination .disabled a{
  color: grey;
}
.pagination .disabled a:hover {
  background: inherit;
  text-decoration:none;
}
.batchList table {
  width: 100%;
}
.batchList table th:nth-child(1) {/* th for empty table*/
  width:10%;
}
.batchList table th:nth-child(2){
  width:50%;
}
</style>
<script>
import Batch from './batch'
import Paginate from 'vuejs-paginate'

const BatchList = {
  props: {
    limit: {
      type: Number,
      default: _ => 20
    },
    additionalBatches: {
      type: Array,
      default: _ => []
    }
  },
  watch: {
    additionalBatches (val) {
      this.batchEvs = this.buildEvs(val)
    }
  },
  computed: {
    newBatches () {
      // The new batches are more recent that the very first batch we've ever drawn
      return Object.values(this.batchEvs).filter(b => b.at > this.firstBatchAt)
    },
    liveBatches () {
      // only additional batches with a version more recent than drawn batch should be taken into account
      return this.batches.map(b => {
        const batchEv = this.batchEvs[b.id]
        if (batchEv && batchEv.version >= b.version) {
          return batchEv
        }
        return b
      })
    }
  },
  data () {
    return {
      page: 1,
      pageCount: 0,
      batches: [],
      batchEvs: this.buildEvs(this.additionalBatches),
      firstBatchAt: 0
    }
  },
  components: {
    'mt-batch': Batch,
    'paginate': Paginate
  },
  async mounted () {
    return this.reload()
  },
  methods: {
    buildEvs (val) {
      return val.reduce((acc, b) => {
        b.live = true
        acc[b.id] = b
        return acc
      }, {})
    },
    async loadPage (page) {
      this.page = page
      const limit = this.limit
      const { count, items } = await this.$store.dispatch('getBatches', { 
        limit: limit,
        offset: (page - 1) * limit 
      })
      this.batches = items
      this.pageCount = Math.ceil(count / this.limit)
      if (page === 1 && this.batches.length) {
        this.firstBatchAt = this.batches[0].at
      }
    },
    async reload () {
      return this.loadPage(this.page)
    }
  }
}
export default BatchList
</script>
