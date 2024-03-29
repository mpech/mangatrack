import { html } from 'hybrids'
import MtViewsHome from '@/views/home'
import MtViewsMe from '@/views/me'
import MtViewsManga from '@/views/manga'
import MtViewsLogin from '@/views/login'
import MtViewsLogout from '@/views/logout'
import MtViewsNotFound from '@/views/notFound'
import { prop, defineAll } from '@/utils/hybrids'
import localHistory from '@/utils/localHistory'

defineAll(
  MtViewsHome,
  MtViewsMe,
  MtViewsManga,
  MtViewsLogin,
  MtViewsLogout,
  MtViewsNotFound
)

const routes = [
  [/(^\/me|#\/me)/, 'mt-me'],
  [/(^\/mangas|#\/mangas)/, 'mt-manga'],
  [/(^\/login|#\/login)/, 'mt-login'],
  [/(^\/logout|#\/logout)/, 'mt-logout'],
  [/(^\/|#\/)$/, 'mt-home'],
  [/.*/, 'mt-not-found']
]

const Router = {
  tag: 'mt-router',
  routes: prop(routes),
  path: {
    value: '',
    connect (host) {
      const fn = () => {
        host.path = window.location.href.replace(window.location.origin, '')
        localHistory.push(host.path)
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
    const isHome = tagName === 'mt-home'
    return html`
      <mt-home load="${isHome}" style="display:${isHome ? 'block' : 'none'}"></mt-home>
      ${tagName !== 'mt-home' && html`<div innerHTML="${`<${tagName}></${tagName}>`}"></div>`}
    `
  }
}

export default Router
