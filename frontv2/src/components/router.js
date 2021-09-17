import '@appnest/web-router'
import { define } from 'hybrids'
import MtViewsHome from '@/views/home'
import MtViewsMe from '@/views/me'
import MtViewsManga from '@/views/manga'
import MtViewsLogin from '@/views/login'
import MtViewsLogout from '@/views/logout'
import MtViewsNotFound from '@/views/notFound'
const defs = define({
  MtViewsHome,
  MtViewsMe,
  MtViewsManga,
  MtViewsLogin,
  MtViewsLogout,
  MtViewsNotFound
})

const routes = [
  ['me', defs.MtViewsMe],
  ['mangas/:mangaId', defs.MtViewsManga],
  ['login', defs.MtViewsLogin],
  ['logout', defs.MtViewsLogout],
  ['/[^\\w]', defs.MtViewsHome],
  ['**', defs.MtViewsNotFound]
].map(([path, component]) => ({ path, component, fuzzy: false }))

const Router = {
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
