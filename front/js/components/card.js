import Vue from '../vue.esm.browser.js'

let tpl = `
    <div class="pure-u-1-8 pure-u-lg-1-6">
        <div class="card">
            <figure>
                <img :src="card.thumbUrl"/>
            </figure>
            <div>
                <h4><span><a :href="card.links.self">{{card.name}}</a></span></h4>
                <div class="chapter">
                    <span>
                        <a :href="card.lastUrl">c<span>{{card.lastNum}}</span>↗</a>
                    </span>
                    <time :updatedAt="card.updatedAt">{{sinceDate}}</time>
                </div>
            </div>
            <hr/>
            <!-- if followed, mark it -->
            <button>Follow</button>
        </div>
    </div>

`
var Card = Vue.component('mt_card',{
    props:['card'],
    data:function(){
        let sinceDate = moment(this.card.updatedAt).fromNow();
        sinceDate = sinceDate.replace('minutes','min')
        sinceDate = sinceDate.replace('seconds','sec')
        return {
            sinceDate
        }
    },
    template:tpl
});

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

export {Card}