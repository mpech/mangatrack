import { html, dispatch } from 'hybrids'
import debounce from 'debounce'

const myDebounce = debounce(({ q, minChapters, name, cb }) => {
  name === 'q' && (q.length === 0 || q.length >= 3) && cb()
  name === 'minChapters' && cb()
}, 1000)

const onKeyUp = (host, { target: { name, value } }) => {
  const { q, minChapters } = host
  const cb = () => {
    host[name] = value
    dispatch(host, 'search', { detail: { q, minChapters, [name]: value } })
  }
  myDebounce({ name, q, minChapters, [name]: value, cb })
}

export default {
  tag: 'MtFilterForm',
  q: { set: (host, val) => val },
  minChapters: { set: (host, val) => val },
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
