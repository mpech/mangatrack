import Vue from './vue.esm.browser.js'
import {Grid} from './components/grid.js'
import {routes} from './config.js'

let Home = Vue.component('mt-home',{
    data:function(){
        return {
            mangas:[]
        }
    },
    components:{
        'mt-grid':Grid
    },
    template:'<mt-grid :mangas="mangas" class="mt-grid"></mt-grid>',
    mounted(){

        return axios.get(routes.mangas).then(({data:{items}})=>{
            this.mangas = items;
        }).catch(e=>{
            console.log('failed', e);
        })
    }
});
/*
TODO: fetch the stuff
 */

export {Home}