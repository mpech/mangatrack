<template>
  <div class="mt-pagination">
      <a @click="more" class="pure-button" href="#">Moar</a>
  </div>
</template>

<script>
const MtPagination = {
  methods: {
    more (e) {
      e.preventDefault()
      return this.$emit('more')
    }
  }
}
export default MtPagination
</script>