import Vue from '../vue.esm.browser.js'
import {Card} from './card.js'

(function mt_pagination(Vue){
let tpl = `
<div>
    pagination
</div>
`
    return Vue.component('mt-pagination',{
        template:tpl
    });
})(Vue);


(function mt_filters(Vue){
let tpl = `
<div>
    filters
</div>
`
    return Vue.component('mt-filters',{
        template:tpl
    });
})(Vue);


let tpl = `
<div>
    <!--<mt-filters></mt-filters>-->
    <div class="pure-g">
        <mt_card v-for="manga in mangas" v-bind:key="manga.nameId" v-bind:card="manga" url="/manga"></mt_card>
    </div>
    <mt-pagination></mt-pagination>
</div>
`
let Grid = Vue.component('mt-grid',{
    props:['mangas'],
    components:{
        'mt-card':Card
    },
    template:tpl
});
export {Grid}
