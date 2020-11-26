<template>
  
  <div class="pure-menu pure-menu-horizontal">
    <!-- use router-link component for navigation. -->
    <!-- specify the link by passing the to prop. -->
    <!-- <router-link> will be rendered as an <a> tag by default -->
    <!-- actually, DO reload on home click -->
    <a href="/" class="pure-menu-heading pure-menu-link"
      :class="{active: active.home}"
    >MangaTrack</a>

    <a href="/me"
      class="pure-menu-heading pure-menu-link"
      :class="{active: active.me}"
      title="my space"
    >Me</a>

    <router-link to="/admin" 
      class="pure-menu-heading pure-menu-link admin"
      :class="{hide: !logged, active: active.admin}"
    >Admin</router-link>

    <router-link to="/login" 
      class="pure-menu-heading pure-menu-link login" 
      :class="{hide:logged, active: active.login}"
      title="Mainly sync your tracked stuff"
    >Login</router-link>

    <router-link to="/login" 
      class="pure-menu-heading pure-menu-link logout"
      :class="{hide:!logged, active: active.login}"
    >Logout</router-link>
  </div>

</template>
<style scoped>
.active {
  color: #ff8080;
}
.admin.hide {
  display: none;
}
</style>
<script>

const Menu = {
  computed: {
    logged () {
      return !!this.$store.getters.accessToken
    },
    admin () {
      return !!this.$store.getters.isAdmin
    },
    active () {
      const { path } = this.$route
      return {
        home: path === '/',
        me: path === '/me',
        admin: path === '/admin',
        login: path === '/login'
      }
    }
  },
  mounted () {
    this.$el.querySelector('.logout').onclick = e => {
      this.$store.dispatch('logout')
    }
  }
}

export default Menu
</script>