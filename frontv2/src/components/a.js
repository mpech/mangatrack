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

export const handleScroll = (host, e) => {
  const a = e.target
  const hasAnchor = a.to.includes('#')
  if (!hasAnchor) return
  e.preventDefault()
  const el = host.shadowRoot.getElementById(a.to.replace('#', ''))
  el && el.scrollIntoView(false)
  e.preventDefault()
  return false
}
export default A
