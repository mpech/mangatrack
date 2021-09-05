import '@appnest/web-router'
import { define } from 'hybrids'
import MtViewsHome from '/views/home'
import MtViewsMe from '/views/me'
import MtViewsManga from '/views/manga'
import MtViewsLogin from '/views/login'
import MtViewsLogout from '/views/logout'
const defs = define({
  MtViewsHome,
  MtViewsMe,
  MtViewsManga,
  MtViewsLogin,
  MtViewsLogout,
})

const routes = [
  ['/me', defs.MtViewsMe],
  ['/mangas/:mangaId', defs.MtViewsManga],
  ['/login', defs.MtViewsLogin],
  ['/logout', defs.MtViewsLogout],
  ['/', defs.MtViewsHome],
].map(([path, component]) => ({ path, component }))

const Router = {
  routes,
  render: () => (host, target) => {
    // https://github.com/hybridsjs/hybrids/issues/78
    target.innerHTML = ''
    const router = document.createElement('router-slot')
    target.appendChild(router)
    router.add(host.routes)
  }
}

export default Router