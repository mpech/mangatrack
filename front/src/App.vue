<template>
  <div id="app">
    <mt-menu></mt-menu>

    <div id="pageDisplay">
      <router-view></router-view>
    </div>
    <notifications/>
  </div>
</template>


<script>

import '../node_modules/purecss/build/pure-min.css'
import '../node_modules/purecss/build/grids-responsive-min.css'
import '../node_modules/@trevoreyre/autocomplete-vue/dist/style.css'
import './index.css'

import Menu from './components/menu'

export default {
  name: 'App',
  components: {
    'mt-menu': Menu
  }
}

</script>
