import Vue from './vue.esm.browser.min.js'
import VueRouter from './vue-router.esm.browser.min.js'
import Vuex from './vuex.esm.browser.min.js'
import { Home } from './home.js'
import { MangaView } from './mangaView.js'
import { SignIn } from './signIn.js'
import { routes as apiRoutes, symbols } from './config.js'
import { NotFoundComponent } from './components/notFound.js'
import OnOffAxios from './onOffAxios.js'

Vue.use(VueRouter)
Vue.use(Vuex)

const routes = [
  { path: '/', component: Home },
  { path: '/manga/:nameId', component: MangaView },
  { path: '/login', component: SignIn },
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

const store = new Vuex.Store({
  state: {
    mangas: [],
    myMangas: [],
    moreMangas: { next: apiRoutes.mangas },
    accessToken: null,
    refreshToken: null
  },
  mutations: {
    fetchMangas (state, { items, links }) {
      state.mangas = state.mangas.concat(items)
      state.moreMangas = links
    },
    trackManga (state, trackedManga) {
      state.myMangas.push(trackedManga)
      state.mangas = state.mangas.map(m => {
        if (m.nameId === trackedManga.nameId) {
          Vue.set(m, 'followed', true)
          m.followed = true
        }
        return m
      })
    },
    untrackManga (state, untrackedManga) {
      const idx = state.myMangas.findIndex(m => m.nameId === untrackedManga.nameId)
      if (idx !== -1) {
        state.myMangas.splice(idx, 1)
      }
      state.mangas = state.mangas.map(m => {
        if (m.nameId === untrackedManga.nameId) {
          m.followed = false
        }
        return m
      })
    },
    authenticate (state, { accessToken, refreshToken }) {
      state.accessToken = accessToken
      state.refreshToken = refreshToken
    },
    sync (state, { items }) {
      state.myMangas = items
    }
  },
  actions: {
    fetchMangas (context) {
      const payload = {
        params: {
          limit: 18
        }
      }
      let url = context.state.moreMangas.next
      if (url) {
        // should not occur, but should not fail either
        url = url.replace(/limit=\d+/, '')// do not send an array of limit
        return axios.get(url, payload).then(({ data }) => {
          context.commit('fetchMangas', data)
        })
      }
    },
    trackManga (context, { nameId }) {
      return this.axios.put(apiRoutes.myMangas.replace('{{nameId}}', nameId), { num: symbols.ALL_READ }).then(({ data }) => {
        context.commit('trackManga', data)
      })
    },
    untrackManga (context, { nameId }) {
      return this.axios.delete(apiRoutes.myMangas.replace('{{nameId}}', nameId)).then(({ data }) => {
        context.commit('untrackManga', { nameId })
      })
    },
    sync (context) {
      return this.axios.patch(apiRoutes.myMangaSuite, context.state.myMangas).then(({ data }) => {
        context.commit('sync', data)
      })
    }
  },
  getters: {
    accessToken (state) {
      return state.accessToken
    }
  }
})

store.axios = new OnOffAxios(store)

new Vue({
  router,
  store
}).$mount('#main')
