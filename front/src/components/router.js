import { html, define } from 'hybrids'
import MtViewsHome from '@/views/home'
import MtViewsMe from '@/views/me'
import MtViewsManga from '@/views/manga'
import MtViewsLogin from '@/views/login'
import MtViewsLogout from '@/views/logout'
import MtViewsNotFound from '@/views/notFound'
define(
  MtViewsHome,
  MtViewsMe,
  MtViewsManga,
  MtViewsLogin,
  MtViewsLogout,
  MtViewsNotFound
)

const routes = [
  [/^\/(?:#\/)?me/, 'mt-me'],
  [/^\/(?:#\/)?mangas\/[^/]+/, 'mt-manga'],
  [/^\/(?:#\/)?login/, 'mt-login'],
  [/^\/(?:#\/)?logout/, 'mt-logout'],
  [/^\/(?:#\/)?$/, 'mt-home'],
  [/.*/, 'mt-not-found']
]

const Router = {
  tag: 'mt-router',
  routes,
  path: {
    connect (host) {
      const fn = () => {
        host.path = window.location.href.replace(window.location.origin, '')
      }
      fn()
      window.addEventListener('hashchange', fn)
      return () => {
        window.removeEventListener('hashchange', fn)
      }
    }
  },
  tagName: {
    get: ({ path, routes }) => {
      return routes.find(([reg, tagName]) => reg.test(path))[1]
    }
  },
  render: ({ tagName }) => {
    return html`
      <mt-home style="--display-home: ${tagName === 'mt-home' ? '' : 'none'}"></mt-home>
      ${tagName !== 'mt-home' && html`<div innerHTML="${`<${tagName}></${tagName}>`}"></div>`}
    `.style`
    mt-home {
      display: var(--display-home);
    }
`
  }
}

export default Router
