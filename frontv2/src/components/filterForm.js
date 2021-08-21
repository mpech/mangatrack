import { html, define, store } from 'hybrids'
import debounce from 'debounce'
import { fetchMangas } from '../api'
import mangas, { setMangas } from '../store/mangas'

const myDebounce = debounce(({ q, minChapters, name, cb }) => {
  name === 'q' && (q.length === 0 || q.length >= 3) && cb()
  name === 'minChapters' && cb()
}, 1000)

const onKeyUp = (host, { target: { name, value } }) => {
  const { q, minChapters } = host
  const cb = () => {
    host.reload = { q, minChapters, [name]:value }
  }
  myDebounce({ name, q, minChapters, [name]:value, cb })
}

/*const onMore = ({ offset }, e) => {}*/
const reload = ({ q, minChapters }) => fetchMangas({ q, minChapters }).then(setMangas).catch(e => console.log(e))
const FilterForm = {
  q: { set: (host, val) => val },
  minChapters: { set: (host, val) => val },
  reload: {
    connect (host) {
      host.q = ''
      host.minChapters = undefined
      reload({ q: host.q, minChapters: host.minChapters })
    },
    set (host, { q, minChapters }) {
      host.q = q
      host.minChapters = minChapters
      reload({ q: host.q, minChapters: host.minChapters })
    }
  },
  mangas: store(mangas),
  render: () => html`
    <div id="filterForm">
      <div>
        <input placeholder="manga name" type="text" name="q" onkeyup=${onKeyUp}></input>
        <input placeholder="min chapters" type="text" name="minChapters" pattern="[0-9]*" onkeyup=${onKeyUp}></input>
      </div>
    </div>
  `.style(`
#filterForm input {
  border: none;
  padding:12px 12px 12px 48px;
  box-sizing: border-box;
  display: inline-box;
  margin-bottom: 2px;
  background-color: #fff;
  outline: none;
  box-shadow: 0 2px 2px rgba(0,0,0,.16);
  border: 1px solid #eee;
  border-radius: 8px;
  margin-right: 20px;
}
:host {
  display: block;
}
    `)
}
export default FilterForm

