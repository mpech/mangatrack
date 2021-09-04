import { html } from 'hybrids'

const A = {
  to: '',
  render: ({ to }) => (html`
<a href="${to}">
  <slot></slot>
</a>
  `).style(`
a {
  color: var(--a-color, #1976d2);
  cursor: pointer;
}
a:link, a:visited {
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
  color: var(--a-hover-color, var(--a-color, #1976d2));
}
  `)
}
export default A
