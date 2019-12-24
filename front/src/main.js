import Vue from 'vue'
import App from './App'
import store from './store/index.js'
import router from './router/index.js'

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
