import Vue from './vue.esm.browser.js';
import {routes} from './config.js'
let tpl = `
<section id="mangaView">
    <table class="pure-table">
        <thead>
            <th>Chapter</th>
            <th title="mark as read"><span class="truckkun">⛟</span></th>
        </thead>
        <tbody>
            <tr v-for="chapter in chapters" v-bind:key="chapter.num" :class="{read:chapter.isekaied}">
                <td><a :href="chapter.url">c{{chapter.num}}</a></td>
                <td :data-num="chapter.num"></td>
            </tr>
        </tbody>
    </table>
</section>
`

let MangaView = Vue.component('mt-mangaview',{
    data:function(){
        return {
            chapters:[]
        }
    },
    mounted(){
        let tbody = this.$el.querySelector('tbody');
        tbody.onmouseover = e=>{
            if(e.target.nodeName != 'TD'){
                return;
            }
            let td = e.target;
            if(td.parentNode.children[1] != td){
                return;
            }

            //repaint grid
            let idx = this.chapters.findIndex(c=>c.num==parseFloat(td.getAttribute('data-num')));
            this.chapters.forEach((x,i)=>{
                if(i<idx){
                    x.isekaied = false;
                }else{
                    x.isekaied = true;
                }
            });
        }

        this.$el.querySelector('tbody').onmouseleave = e=>{
            if(e.target.nodeName == 'TD'){
                return;
            }
            this.chapters.forEach((x,i)=>{
                x.isekaied = x.read;
            });
        }

        tbody.onclick = e=>{
            if(e.target.nodeName != 'TD'){
                return;
            }
            let td = e.target;
            if(td.parentNode.children[1] != td){
                return;
            }

            let num = td.getAttribute('data-num');
            return axios.put(routes.tracks.replace('{{nameId}}', this.$route.params.nameId), {num}).then(_=>{
                this.chapters = this.chapters.map((x,i)=>{
                    if(i >= num){
                        x.read = true;
                    }
                    x.isekaied=x.read
                    return x;
                });
            }).catch(e=>{
                console.log('failed', e);
            })
        }

        let url = routes.chapters.replace('{{nameId}}', this.$route.params.nameId);
        return axios.get(url).then(({data:{items}})=>{
            this.chapters = items.map(x=>(x.isekaied=x.read,x));
        }).catch(e=>{
            console.log('failed', e);
        })
    },
    template:tpl
});





export {MangaView}