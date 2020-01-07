<template>
  <table class="pure-table batchList">
    <thead>
      <tr>
        <th>status</th>
        <th>link</th>
        <th>at</th>
      </tr>
    </thead>
    <tbody>
      <mt-batch 
        v-for="batch in batches"
        :key="batch.id"
        :batch="batch"
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
.batchList {
  width: 100%;
}
.batchList th:nth-child(1) {/* th for empty table*/
  width:10%;
}
.batchList th:nth-child(2){
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
    }
  },
  data () {
    return {
      page: 1,
      pageCount: 0,
      batches: []
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
    async loadPage (page) {
      this.page = page
      const limit = this.limit
      const { count, items } = await this.$store.dispatch('getBatches', { 
        limit: limit,
        offset: (page - 1) * limit 
      })
      this.batches = items
      this.pageCount = Math.ceil(count / this.limit)
    },
    async reload () {
      return this.loadPage(this.page)
    }
  }
}
export default BatchList
</script>
