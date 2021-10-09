import { html, dispatch } from 'hybrids'
import debounce from 'debounce'

const myDebounce = debounce(host => {
  const { q, minChapters, jn, cn, kr } = host
  if (q.length > 0 && q.length < 3) { return }
  dispatch(host, 'search', { detail: { q, minChapters, jn, cn, kr } })
}, 1000)

const onKeyUp = (host, { target: { name, value } }) => {
  host[name] = value
  myDebounce(host)
}

const onCheck = (host, { target: { checked, name } }) => {
  host[name] = checked
  myDebounce(host)
}

export default {
  tag: 'MtFilterForm',
  q: { get: (host, val = '') => val, set: (host, val) => val },
  kr: { get: (host, val = true) => val, set: (host, val) => val },
  cn: { get: (host, val = true) => val, set: (host, val) => val },
  jn: { get: (host, val = true) => val, set: (host, val) => val },
  minChapters: { get: (host, val = 0) => val, set: (host, val) => val },
  render: ({ kr, cn, jn }) => html`
    <input placeholder="manga name" type="text" name="q" onkeyup=${onKeyUp}></input>
    <input placeholder="min chapters" type="text" name="minChapters" pattern="[0-9]*" onkeyup=${onKeyUp}></input>
    ${['jn', 'kr', 'cn'].map(tag => html`<input type="checkbox" onchange="${onCheck}" checked="${tag}" name="${tag}"/><label for="${tag}">${tag}</label>`)}
  `.style(`
input[type="text"] {
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
input[type="checkbox"] {
  cursor: pointer;
}
input[type="checkbox"]:nth-child(n+1) {
  margin-left: 10px;
}
:host {
  display: flex;
  align-items: center;
}
    `)
}
