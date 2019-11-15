import Vue from '../vue.esm.browser.js'

let tpl = `
    <div class="pure-u-1-8 pure-u-lg-1-6">
        <div class="card">
            <figure>
                <img :src="card.thumbUrl"/>
            </figure>
            <div>
                <h4><span><router-link :to="url+'/'+card.nameId">{{card.name}}</router-link></span></h4>
                <div class="chapter">
                    <span>
                        <a :href="lastItem.url">c<span>{{lastItem.num}}</span>↗</a>
                    </span>
                    <time :updatedAt="lastItem.at">{{lastItem.at}}</time>
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
            sinceDate,
            lastItem: this.lastItem||{}
        }
    },
    template:tpl
});
export {Card}