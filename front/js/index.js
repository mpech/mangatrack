import Vue from './vue.esm.browser.js'
import VueRouter from './vue-router.esm.browser.min.js'
import {Home} from './home.js'
import {MangaView} from './mangaView.js'
Vue.use(VueRouter);


const routes = [
  { path: '/', component: Home },
  { path: '/manga/:nameId', component: MangaView }
]

const router = new VueRouter({
  routes
})

const vm = new Vue({
  router
}).$mount('#main')
