import Vue from './vendors/vue.esm.browser.min.js'
import VueRouter from './vendors/vue-router.esm.browser.min.js'
import Vuex from './vendors/vuex.esm.browser.min.js'
import { Home } from './home.js'
import './menu.js'
import { MangaView } from './mangaView.js'
import { SignIn } from './signIn.js'
import { Me } from './me.js'
import { routes as apiRoutes } from './config.js'
import { NotFoundComponent } from './components/notFound.js'
import OnOffAxios from './onOffAxios.js'
Vue.use(VueRouter)
Vue.use(Vuex)

const routes = [
  { path: '/', component: Home },
  { path: '/manga/:nameId', component: MangaView },
  { path: '/me', component: Me },
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

const vuexLocal = new VuexPersistence.VuexPersistence({
  storage: window.localStorage,
  reducer: ({ accessToken, refreshToken, myMangas }) => {
    return { accessToken, refreshToken, myMangas }
  }
})

const store = new Vuex.Store({
  state: {
    mangas: [],
    myMangas: {},
    myPopulatedMangas: [],
    moreMangas: { next: apiRoutes.mangas },
    accessToken: null,
    refreshToken: null
  },
  plugins: [vuexLocal.plugin],
  mutations: {
    fetchMangas (state, { items, links }) {
      state.mangas = state.mangas.concat(items)
      state.moreMangas = links
    },
    fetchMyMangas (state, data) {
      if (data === state.myMangas) {
        return
      }
      state.myMangas = data.items.reduce((acc, { mangaId, num }) => {
        acc[mangaId] = num
        return acc
      }, {})
    },
    fetchMyPopulatedMangas (state, { items, links }) {
      state.myPopulatedMangas = items
    },
    trackManga (state, trackedManga) {
      state.myMangas[trackedManga.id] = trackedManga.num
      state.myMangas = { ...state.myMangas }
    },
    untrackManga (state, untrackedManga) {
      const { [untrackedManga.id]: del, ...others } = { ...state.myMangas }
      state.myMangas = others
    },
    authenticate (state, { accessToken, refreshToken }) {
      state.accessToken = accessToken
      state.refreshToken = refreshToken
    },
    logout (state) {
      state.accessToken = null
      state.refreshToken = null
    }
  },
  actions: {
    async fetchMangas (context) {
      const payload = {
        params: {
          limit: 18
        },
        anonAllowed: true
      }
      let url = context.state.moreMangas.next
      if (url) {
        // should not occur, but should not fail either
        url = url.replace(/limit=\d+/, '')// do not send an array of limit
        const { data } = await this.axios.get(url, payload)
        context.commit('fetchMangas', data)
      }
    },
    async fetchMyMangas (context) {
      const { data } = await this.axios.get(apiRoutes.myMangaSuite, _ => {
        return ({ data: context.state.myMangas })
      })
      context.commit('fetchMyMangas', data)
    },
    async fetchMyPopulatedMangas (context) {
      const payload = {
        params: {
          id: Object.keys(context.state.myMangas),
          limit: 50
        },
        anonAllowed: true
      }
      if (payload.params.id.length > 0) {
        const { data } = await this.axios.getAll(apiRoutes.mangas, payload, _ => {
          return ({ data: { items: context.state.myPopulatedMangas } })
        })
        context.commit('fetchMyPopulatedMangas', data)
      } else {
        context.commit('fetchMyPopulatedMangas', { items: [] })
      }
    },
    async trackManga (context, { id, num }) {
      const { data } = await this.axios.put(apiRoutes.myMangas.replace('{{mangaId}}', id), { num }, _ => ({ data: { mangaId: id, num } }))
      context.commit('trackManga', { id: data.mangaId, num: data.num })
    },
    async untrackManga (context, { id }) {
      await this.axios.delete(apiRoutes.myMangas.replace('{{mangaId}}', id), _=>{})
      context.commit('untrackManga', { id })
    },
    async sync (context) {
      const items = Object.keys(context.state.myMangas).reduce((acc, id) => {
        acc.push({ mangaId: id, num: context.state.myMangas[id] })
        return acc
      }, [])
      await this.axios.patch(apiRoutes.myMangaSuite, { items })
      this.dispatch('fetchMyMangas')
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
