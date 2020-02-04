import Vue from 'vue'
import App from './App'
import store from './store/index.js'
import router from './router/index.js'
import Notifications from 'vue-notification'

Vue.config.productionTip = false
Vue.use(Notifications)
/* eslint-disable no-new */
window.vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
