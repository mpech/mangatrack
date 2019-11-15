import Vue from './vue.esm.browser.js'
import {Grid} from './components/grid.js'

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

        console.log('refreshing!!')
        this.mangas=[
            {nameId:'the great sorcerer', name:'the great sorcerer will never die but maybe still', lastNum:10, updatedAt:Date.now()-300*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"http://mangatrackapi/mangas/a"}}, 
            {nameId:'some wizardry', name:'some wizardry', lastNum:15, updatedAt: Date.now()-3600*2000, thumbUrl:'https://images02.military.com/sites/default/files/styles/full/public/media/veteran-jobs/content-images/2016/03/chucknorris.jpg?itok=_J3M4O-S', links:{self:"/mangas/b"}},

            {nameId:'the great sorcerera', name:'the great sorcerer', lastNum:10, updatedAt:Date.now()-24*3600*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
            {nameId:'some wizardrya', name:'some wizardry', lastNum:15, updatedAt: Date.now()-2*24*3600*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}},

            {nameId:'the great sorcererb', name:'the great sorcerer', lastNum:10, updatedAt:Date.now()-15*24*3600*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
            {nameId:'some wizardryb', name:'some wizardry', lastNum:15, updatedAt: Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}},

            {nameId:'the great sorcererc', name:'the great sorcerer', lastNum:10, updatedAt:Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
            {nameId:'some wizardryc', name:'some wizardry', lastNum:15, updatedAt: Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}},

            {nameId:'the great sorcererd', name:'the great sorcerer', lastNum:10, updatedAt:Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
            {nameId:'some wizardryd', name:'some wizardry', lastNum:15, updatedAt: Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}}
        ].slice(0);
    }
});
/*
TODO: fetch the stuff
 */

export {Home}