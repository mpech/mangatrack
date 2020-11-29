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

const Router = {
  routes: [
    {
      path: "/me",
      component: defs.MtViewsMe
    },
    {
      path: "/mangas/:mangaId",
      component: defs.MtViewsManga
    },
    {
      path: "/",
      component: defs.MtViewsHome
    }
  ],
  render: () => (host, target) => {
    // https://github.com/hybridsjs/hybrids/issues/78
    target.innerHTML = ''
    const router = document.createElement('router-slot')
    target.appendChild(router)
    router.add(host.routes)
  }
}

export default Router