import { html, define, property, dispatch, store } from 'hybrids'

import mangas, { setMangas } from '../store/mangas'

const handleClick = (host) => dispatch(host, 'mt-click')

const Grid = {
  mangas: store(mangas),
  render: () => html`
  <div>
    <div>
      
    </div>
  </div>
  <button onclick="${handleClick}">Moar</button>
  <style>
  :host > div {
    display: grid;
  }
  </style>
`
}
export default Grid