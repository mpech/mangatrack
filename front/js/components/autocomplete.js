import Vue from '../vendors/vue.esm.browser.min.js'
import TrevoreyreAuto from '../vendors/autocomplete.esm.min.js'

const tpl = `
<div>
<autocomplete 
  :search="search"
  :get-result-value="getResultValue"
  placeholder="Search mangas"
  aria-label="Search mangas"
  @submit="onSubmit"></autocomplete>
</div>
`
const Autocomplete = {
  data () {
    return {
      timeout: 0,
      _q: ''
    }
  },
  components: {
    autocomplete: TrevoreyreAuto
  },
  computed: {
    followMangas () {
      return this.mangas.map(m => {
        Vue.set(m, 'followed', typeof (this.myMangas[m.id]) !== 'undefined')
        Vue.set(m, 'num', this.myMangas[m.id])
        return m
      })
    }
  },
  methods: {
    search (q) {
      this._q = q
      if (q.length < 3) {
        return []
      }
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      return new Promise((resolve, reject) => {
        this.timeout = setTimeout(_ => {
          return this.$store.dispatch('searchMangas', { q }).then(res => {
            return resolve(res.items)
          }).catch(reject)
        }, 300)
      })
    },
    getResultValue (result) {
      return result.name
    },
    onSubmit (e) {
      if (e) {
        const nameId = e.nameId
        this.$router.push(`/manga/${nameId}`)
      } else {
        const q = this._q
        this.$store.dispatch('filterMangas', { q })
      }
    }
  },
  template: tpl
}
export { Autocomplete }
