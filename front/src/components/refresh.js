import { html } from 'hybrids'

export default {
  tag: 'MtRefresh',
  render: () => html`
    <button title="refresh chapters">⟳</button>
  `.style(`
:host {
  text-align: center;
}
button {
  color: red;
  border: none;
  cursor: pointer;
}
button:hover {
  opacity: 0.5;
}
  `)
}
