import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home'
import MangaView from '../views/mangaView'
import SignIn from '../views/signIn'
import Me from '../views/me'
import Admin from '../views/admin'
import NotFoundComponent from '../views/notFound'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Home },
  { path: '/manga/:nameId', component: MangaView },
  { path: '/me', component: Me },
  { path: '/login', component: SignIn },
  { path: '/admin', component: Admin },
  { path: '*', component: NotFoundComponent }
]

const router = new VueRouter({
  mode: 'history',
  routes,
  // https://router.vuejs.org/guide/advanced/scroll-behavior.html#async-scrolling
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { x: 0, y: 0 }
  }
})

export default router
