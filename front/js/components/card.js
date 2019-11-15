import Vue from '../vue.esm.browser.js'

let tpl = `
    <div class="pure-u-1-8 pure-u-lg-1-6">
        <div class="card">
            <figure>
                <img :src="card.thumbUrl"/>
            </figure>
            <div>
                <h4><span><a :href="url+'/'+card.nameId">{{card.name}}</a></span></h4>
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

`;

var Card = Vue.component('mt_card',{
    props:['card', 'url'],
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
export {Card}