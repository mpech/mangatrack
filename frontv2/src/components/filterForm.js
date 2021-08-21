import { html, define, store } from 'hybrids'
import debounce from 'debounce'
import api from '../api'
import mangas, { setMangas } from '../store/mangas'

const defaultQ = q => q.length >= 3 ? q : undefined
const myDebounce = debounce((q, min, cb) => (defaultQ(q) || q.length === 0 || min) && cb(), 1000)

const onKeyUp = ({ q, min }, e) => {
  host[e.target.name] = e.target.value
  myDebounce(host.q, host.min, () => {
    api.fetchMangas({ q, minChapters }).then(setMangas)
  })
}

/*const onMore = ({ offset }, e) => {}*/

const FilterForm = {
  q: '',
  minChapters: '',
  _useEffect: ({ q, minChapters, offset }) => {
    console.log('exect')
    return api.fetchMangas({ q, minChapters }).then(setMangas)
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
}
:host {
  display: block;
}
    `)
}
export default FilterForm

