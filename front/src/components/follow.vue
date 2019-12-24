<template>
  <span>
      <span @click="onclick" :class="{followed:followed, 'mt-follow':1}" :title="title"><a href="#">♥</a></span>
  </span>
</template>

<script>
export default  {
  props: ['followed', 'name'],
  computed: {
    title () {
      if (this.followed) {
        return 'Untrack ' + this.name
      }
      return 'Track ' + this.name
    }
  },
  methods: {
    onclick (e) {
      e.preventDefault()
      return this.$emit(!this.followed ? 'follow' : 'unfollow')
    }
  }
}
</script>

<style scoped>
.mt-follow a:hover{
    color:pink;
    text-decoration:none;
}
.mt-follow.followed a{
    color:red;
}
</style>
