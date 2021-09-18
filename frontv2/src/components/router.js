import '@appnest/web-router'
import { define } from 'hybrids'
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
  ['me', document.createElement('mt-me')],
  ['mangas/:mangaId', document.createElement('mt-manga')],
  ['login', document.createElement('mt-login')],
  ['logout', document.createElement('mt-logout')],
  ['/[^\\w]', document.createElement('mt-home')],
  ['**', document.createElement('mt-not-found')]
].map(([path, component]) => ({ path, component, fuzzy: false }))

const Router = {
  tag: 'mt-router',
  routes,
  render: () => (host, target) => {
    // https://github.com/hybridsjs/hybrids/issues/78
    /* target.innerHTML = '' */
    const router = document.createElement('router-slot')
    target.appendChild(router)
    router.add(host.routes)
  }
}

export default Router
