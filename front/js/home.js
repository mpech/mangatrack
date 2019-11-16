import Vue from './vue.esm.browser.js'
import {Grid} from './components/grid.js'
import {routes} from './config.js'
let Home = Vue.component('mt-home',{
    computed:{
        mangas(){
            return this.$store.state.mangas
        }
    },
    components:{
        'mt-grid':Grid
    },
    template:'<mt-grid :mangas="mangas" class="mt-grid"></mt-grid>',
    mounted(){
        if(!this.mangas.length){
            return this.$store.dispatch('fetchMangas');
        }
    }
});
export {Home}