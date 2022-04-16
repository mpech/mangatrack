import { html } from 'hybrids'

export default {
  tag: 'mt-h1',
  render: () => (html`
<h1>
  <slot></slot>
</h1>
  `).style`
h1 {
  color: var(--title-color);
  font-family: var(--title-font-family);
}
  `
}
