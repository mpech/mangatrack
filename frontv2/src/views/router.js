import '@appnest/web-router'
import { define } from 'hybrids'
import home from '/views/home'
import me from '/views/me'
import manga from '/views/manga'

const defs = define({
  MtViewsHome: home,
  MtViewsMe: me,
  MtViewsManga: manga
})

const routes = [
  ['/me', defs.MtViewsMe],
  ['/mangas/:mangaId', defs.MtViewsManga],
  ['/', defs.MtViewsHome]
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