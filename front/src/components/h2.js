import { html } from 'hybrids'

export default {
  tag: 'mt-h2',
  render: () => (html`
<h2>
  <slot></slot>
</h2>
  `).style`
h2 {
  color: var(--title-color);
  font-family: var(--title-font-family);
}
  `
}
