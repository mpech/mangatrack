import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import OnOffAxios from '../libs/onOffAxios.js'
import { routes as apiRoutes } from '../config.js'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
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
    filterMangas (state, { items, links }) {
      state.mangas = items
      state.moreMangas = apiRoutes.mangas
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
    async filterMangas (context, { q }) {
      if (!q) {
        // whenever you filter mangas, and you apply an empty filter
        // reinitializes the standard pagination
        context.state.mangas = []
        context.state.moreMangas = { next: apiRoutes.mangas }
        return this.dispatch('fetchMangas')
      }
      const payload = {
        anonAllowed: true,
        params: { q }
      }
      const { data } = await this.axios.get(apiRoutes.mangas, payload)
      context.commit('filterMangas', data)
      return data
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
      await this.axios.delete(apiRoutes.myMangas.replace('{{mangaId}}', id), _ => {})
      context.commit('untrackManga', { id })
    },
    async sync (context) {
      const items = Object.keys(context.state.myMangas).reduce((acc, id) => {
        acc.push({ mangaId: id, num: context.state.myMangas[id] })
        return acc
      }, [])
      if (items.length) {
        await this.axios.patch(apiRoutes.myMangaSuite, { items })
      }
      this.dispatch('fetchMyMangas')
    },
    async searchMangas (context, { q } = {}) {
      const payload = {
        params: {
          q,
          sort: 'search=1'
        },
        anonAllowed: true
      }
      return this.axios.get(apiRoutes.mangas, payload).then(({ data }) => data)
    },
    async fetchMangaDetail (context, { nameId }) {
      const url = apiRoutes.mangaDetail.replace('{{nameId}}', nameId)
      return this.axios.get(url, { anonAllowed: true })
    }
  },
  getters: {
    accessToken (state) {
      return state.accessToken
    }
  }
})

store.axios = new OnOffAxios(store)
export default store
