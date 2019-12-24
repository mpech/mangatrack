<template>
  
  <div class="pure-menu pure-menu-horizontal">
    <!-- use router-link component for navigation. -->
    <!-- specify the link by passing the to prop. -->
    <!-- <router-link> will be rendered as an <a> tag by default -->
    <!-- actually, DO reload on home click -->
    <a href="/" class="pure-menu-heading pure-menu-link">MangaTrack</a>

    <a href="/me"
      class="pure-menu-heading pure-menu-link"
      title="my space"
    >Me</a>

    <router-link to="/login" 
      class="pure-menu-heading pure-menu-link login" 
      :class="{hide:logged}"
      title="Mainly sync your tracked stuff"
    >Login</router-link>


    <router-link to="/login" 
      class="pure-menu-heading pure-menu-link logout"
      :class="{hide:!logged}"
    >Logout</router-link>
  </div>

</template>
<script>

const Menu = {
  computed: {
    logged () {
      return !!this.$store.getters.accessToken
    }
  },
  mounted () {
    this.$el.querySelector('.logout').onclick = e => {
      this.$store.commit('logout')
    }
  }
}

export default Menu
</script>