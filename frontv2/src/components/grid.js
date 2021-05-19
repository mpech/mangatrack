import { html, define, property, dispatch } from 'hybrids'

const handleClick = (host) => dispatch(host, 'mt-click')

const Grid = {
  render: () => html`
  <div>
    <div>
      
    </div>
  </div>
  <button onclick="${handleClick}">Moar</button>
  <style>
  :host > div {
    display: flex;
  }
  </style>
`
}
export default Grid