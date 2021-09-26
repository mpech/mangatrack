import { html, dispatch } from 'hybrids'

export default {
  tag: 'MtA',
  to: '',
  toSharped: {
    get ({ to }) {
      if (/^(\.|http|\/#)/.test(to)) { return to }
      return '/#' + (to.startsWith('/') ? '' : '/') + to
    }
  },
  render: ({ toSharped }) => (html`
<a href="${toSharped}">
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
  if (el) {
    dispatch(el, 'scroll-into-view', { composed: true, bubbles: true })
    el.scrollIntoView(false)
  }
  e.preventDefault()
  return false
}
