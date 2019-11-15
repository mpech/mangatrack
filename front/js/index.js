import Vue from './vue.esm.browser.js'
import {Card} from './components/card.js'
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


(function mt_grid(Vue){
let tpl = `
<div>
    <!--<mt-filters></mt-filters>-->
    <div class="pure-g">
        <mt_card v-for="manga in mangas" v-bind:key="manga.nameId" v-bind:card="manga"></mt_card>
    </div>
    <mt-pagination></mt-pagination>
</div>
`
    return Vue.component('mt-grid',{
        props:['mangas'],
        components:{
            'mt-card':Card
        },
        template:tpl
    });
})(Vue);

let vm = new Vue({
    el:'#main',
    data:{
        mangas:[]
    },
    template:`
        <mt-grid :mangas="mangas" class="mt-grid"></mt-grid>
    `
});


function test(){
    vm.mangas=[
        {nameId:'the great sorcerer', name:'the great sorcerer will never die but maybe still', lastNum:10, updatedAt:Date.now()-300*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
        {nameId:'some wizardry', name:'some wizardry', lastNum:15, updatedAt: Date.now()-3600*2000, thumbUrl:'https://images02.military.com/sites/default/files/styles/full/public/media/veteran-jobs/content-images/2016/03/chucknorris.jpg?itok=_J3M4O-S', links:{self:"/mangas/b"}},

        {nameId:'the great sorcerer', name:'the great sorcerer', lastNum:10, updatedAt:Date.now()-24*3600*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
        {nameId:'some wizardry', name:'some wizardry', lastNum:15, updatedAt: Date.now()-2*24*3600*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}},

        {nameId:'the great sorcerer', name:'the great sorcerer', lastNum:10, updatedAt:Date.now()-15*24*3600*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
        {nameId:'some wizardry', name:'some wizardry', lastNum:15, updatedAt: Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}},

        {nameId:'the great sorcerer', name:'the great sorcerer', lastNum:10, updatedAt:Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
        {nameId:'some wizardry', name:'some wizardry', lastNum:15, updatedAt: Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}},

        {nameId:'the great sorcerer', name:'the great sorcerer', lastNum:10, updatedAt:Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
        {nameId:'some wizardry', name:'some wizardry', lastNum:15, updatedAt: Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}}
    ]
}
test();
