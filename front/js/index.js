import Vue from './vue.esm.browser.js'
import VueRouter from './vue-router.esm.browser.min.js'
import Vuex from './vuex.esm.browser.min.js'
import {Home} from './home.js'
import {MangaView} from './mangaView.js'
import {routes as apiRoutes, symbols} from './config.js'

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
        myMangas:[],
        moreMangas:{next:apiRoutes.mangas}
    },
    mutations:{
        fetchMangas(state, {items, links}){
            state.mangas = state.mangas.concat(items);
            state.moreMangas = links;
        },
        trackManga(state, trackedManga){
            state.myMangas.push(trackedManga);
            state.mangas = state.mangas.map(m=>{
                if(m.nameId == trackedManga.nameId){
                    Vue.set(m, 'followed', true);
                    m.followed = true;
                }
                return m;
            });
        },
        untrackManga(state, untrackedManga){
            let idx = state.myMangas.findIndex(m=>m.nameId == untrackedManga.nameId);
            if(idx != -1){
                state.myMangas.splice(idx, 1);
            }
            state.mangas = state.mangas.map(m=>{
                if(m.nameId == untrackedManga.nameId){
                    m.followed = false;
                }
                return m;
            });
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
                url = url.replace(/limit=\d+/,'');//do not send an array of limit
                return axios.get(url, payload).then(({data})=>{
                    context.commit('fetchMangas', data)
                }).catch(e=>{
                    console.log('failed', e);
                })
            }
        },
        trackManga(context, {nameId}){
            return axios.put(apiRoutes.myMangas.replace('{{nameId}}', nameId),{num: symbols.ALL_READ}).then(({data})=>{
                context.commit('trackManga', data)
            }).catch(e=>{
                console.log('failed', e);
            })
        },
        untrackManga(context, {nameId}){
            return axios.delete(apiRoutes.myMangas.replace('{{nameId}}', nameId)).then(({data})=>{
                context.commit('untrackManga', {nameId})
            }).catch(e=>{
                console.log('failed', e);
            })
        }
    }
})

const vm = new Vue({
  router,
  store
}).$mount('#main')
