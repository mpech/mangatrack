import Vue from './vue.esm.browser.js'
import VueRouter from './vue-router.esm.browser.min.js'
import Vuex from './vuex.esm.browser.min.js'
import {Home} from './home.js'
import {MangaView} from './mangaView.js'
import {routes as apiRoutes} from './config.js'

Vue.use(VueRouter);
Vue.use(Vuex)


const routes = [
  { path: '/', component: Home },
  { path: '/manga/:nameId', component: MangaView }
]

const router = new VueRouter({
    routes,
    //https://router.vuejs.org/guide/advanced/scroll-behavior.html#async-scrolling
    scrollBehavior (to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { x: 0, y: 0 }
    }

})

const store = new Vuex.Store({
    state: {
        mangas: [],
        moreMangas:{next:apiRoutes.mangas}
    },
    mutations:{
        fetchMangas(state, {items, links}){
            state.mangas = state.mangas.concat(items);
            state.moreMangas = links;
        }
    },
    actions: {
        fetchMangas (context) {
            let payload = {
                params: {
                    limit: 18
                }
            }
            let url = context.state.moreMangas.next;
            if(url){
                //should not occur, but should not fail either
                url = url.replace(/limit=\d+/,'');//do not send an limit array
                return axios.get(url, payload).then(({data})=>{
                    context.commit('fetchMangas', data)
                }).catch(e=>{
                    console.log('failed', e);
                })
            }
        }
    }
})

const vm = new Vue({
  router,
  store
}).$mount('#main')
