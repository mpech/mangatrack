import Vue from '../vendors/vue.esm.browser.min.js'
import { Follow } from './follow.js'

const tpl = `
    <div class="pure-u-1-6 pure-u-lg-1-6">
        <div class="card">
            <figure>
                <img :src="card.thumbUrl"/>
            </figure>
            <div>
                <h4 :title="card.name"><span><router-link :to="url+'/'+card.nameId">{{card.name}}</router-link></span></h4>
                <div class="chapter">
                    <span>
                        <a :href="lastItem.url">c<span>{{lastItem.num}}</span>↗</a>
                    </span>
                    <time :updatedAt="lastItem.at">{{humanDate(lastItem.at)}}</time>
                </div>
            </div>
            <hr/>
            <div style="position:relative;">
                <span v-if="card.followed" class="card-stats">{{card.num}}/{{lastItem.num}}</span>
                <mt-follow @follow="follow" @unfollow="unfollow" :followed="card.followed" :name="card.name"></mt-follow>
            </div>
        </div>
    </div>
`

var Card = Vue.component('mt_card', {
  props: ['card', 'url'],
  data: function () {
    return {
      lastItem: this.card.lastChap || {}
    }
  },
  components: {
    'mt-follow': Follow
  },
  methods: {
    humanDate (at) {
      let sinceDate = moment(at).fromNow()
      sinceDate = sinceDate.replace('minutes', 'min')
      sinceDate = sinceDate.replace('seconds', 'sec')
      return sinceDate
    },
    follow () {
      return this.$store.dispatch('trackManga', { id: this.card.id, num: this.lastItem.num })
    },
    unfollow () {
      return this.$store.dispatch('untrackManga', { id: this.card.id, num: this.lastItem.num })
    }
  },
  template: tpl
})
export { Card }
