import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import OnOffAxios from '../libs/onOffAxios.js'
import { routes as apiRoutes } from '../config.js'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer: ({ accessToken, refreshToken, myMangas, me }) => {
    return { accessToken, refreshToken, myMangas, me }
  }
})

export const mutations = {
  fetchMangas (state, { items, links, reset }) {
    state.mangas = reset ? items : state.mangas.concat(items)
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
    state.me = { anon: true }
  },
  setMe (state, me) {
    state.me = me
  },
  resetMangas (state, me) {
    state.moreMangas = { next: apiRoutes.mangas }
    state.mangas = []
  }
}

export const actions = {
  async fetchMangas (context, { q, minChapters, offset } = {}) {
    const payload = {
      params: {
        limit: 18,
        q,
        minChapters
      },
      anonAllowed: true
    }
    let url = offset === 0 ? apiRoutes.mangas : context.state.moreMangas.next
    if (url) {
      // should not occur, but should not fail either
      url = url.replace(/limit=\d+/, '')// do not send an array of limit
      const { data } = await this.axios.get(url, payload)
      if (offset === 0) {
        data.reset = true
      }
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
    await this.axios.delete(apiRoutes.myMangas.replace('{{mangaId}}', id), _ => {})
    context.commit('untrackManga', { id })
  },
  // bidrectionnal by default, down|up flow to be disabled by caller
  async sync (context, { down = true, up = true } = {}) {
    const items = Object.keys(context.state.myMangas).reduce((acc, id) => {
      acc.push({ mangaId: id, num: context.state.myMangas[id] })
      return acc
    }, [])
    if (up) {
      if (items.length) {
        await this.axios.patch(apiRoutes.myMangaSuite, { items })
      }
    }
    if (up || down) {
      this.dispatch('fetchMyMangas')
    }
  },
  async logout (context) {
    return context.commit('logout')
  },
  async authenticate (context, { accessToken, refreshToken }) {
    context.commit('authenticate', { accessToken, refreshToken })
    const { data } = await this.axios.get(apiRoutes.me)
    context.commit('setMe', data)
    return data
  },
  async refreshToken (context) {
    const params = new URLSearchParams()
    params.append('grant_type', 'refresh_token')
    params.append('client_id', 'mangatrack')
    params.append('refresh_token', context.state.refreshToken)
    const conf = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    }
    try {
      const { data } = await this.axios.raw('post', apiRoutes.oauth, params, conf)
      // commit assumed to never fail
      context.commit('authenticate', { accessToken: data.access_token, refreshToken: data.refresh_token })
    } catch (e) {
      // if even refreshing token fails, consider yourself as logged out
      context.commit('logout')
    }
  },
  async fetchMangaDetail (context, { nameId }) {
    const url = apiRoutes.mangaDetail.replace('{{nameId}}', nameId)
    return this.axios.get(url, { anonAllowed: true })
  },
  async getBatches (context, { offset = 0, limit = 20 } = {}) {
    return this.axios.get(apiRoutes.batches, { params: { offset, limit } }).then(({ data }) => data)
  },
  async getAllBatchesById (context, ids) {
    const payload = {
      params: {
        id: ids,
        limit: 50
      }
    }
    const { data } = await this.axios.getAll(apiRoutes.batches, payload)
    return data
  },
  async importLink (context, { link, refreshThumb, refreshDescription }) {
    const { data } = await this.axios.post(apiRoutes.batches, { link, refreshThumb, refreshDescription }, _ => {
      throw new Error('no fallback available')
    })
    return data
  },
  async refreshManga (context, { id, refreshThumb, refreshDescription }) {
    const { data } = await this.axios.post(apiRoutes.batches, { id, refreshThumb, refreshDescription }, _ => {
      throw new Error('no fallback available')
    })
    return data
  }
}

const store = new Vuex.Store({
  state: {
    mangas: [],
    myMangas: {},
    myPopulatedMangas: [],
    moreMangas: { next: apiRoutes.mangas },
    accessToken: null,
    refreshToken: null,
    me: { anon: true }
  },
  plugins: [vuexLocal.plugin],
  mutations,
  actions,
  getters: {
    accessToken (state) {
      return state.accessToken
    },
    isAdmin (state) {
      return state.me && state.me.admin
    }
  }
})

store.axios = new OnOffAxios(store)
export default store
