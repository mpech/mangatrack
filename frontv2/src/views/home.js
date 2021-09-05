import { html, define } from 'hybrids'
import MtLayout from '/components/layout'
import MtFilterForm from '/components/filterForm'
import MtGrid from '/components/grid'
import { fetchMangas } from '/api'
import safe from '/utils/safe'
import { follow, unfollow, fetchMyMangas } from '/services/manga'
const onfollow = (host, e) => {
  const { id, lastChap: { num } } = e.composedPath()[0].followData
  return follow({
    host,
    onSuccess: res => host.myMangas = host.myMangas.concat(res)
  })
}
const setMangas = host => res => {
  host.mangas = res.items
  host.nextLink = res.links.next
}
const concatMangas = host => res => {
  host.mangas = host.mangas.concat(res.items)
  host.nextLink = res.links.next
}

const search = safe((host, e) => {
  const { detail: { q, minChapters }} = e
  return fetchMangas({ q, minChapters }).then(setMangas(host))
})

const loadMore = safe(host => {
  return host.nextLink && get(host.nextLink).then(concatMangas(host))
})

const Home = {
  mangas: { set: (h, v) => v },
  nextLink: { set: (host, v) => v },
  myMangas: [],
  hasMore: false,
  load: {
    connect (host) {
      host.mangas = []
      host.nextLink = ''
      safe(fetchMangas)().then(setMangas(host))
      fetchMyMangas().then(res => host.myMangas = res.items)
    },
  },
  render: ({ mangas = [], myMangas }) => (html`
    <mt-layout>
      <mt-filter-form onsearch="${search}"></mt-filter-form>
      <mt-grid
        mangas="${mangas}"
        myMangas="${myMangas}"
        onmore="${loadMore}"
        onfollow="${onfollow}"
        onunfollow="${unfollow}"
      ></mt-grid>
    </mt-layout>
`.style(`
  :host mt-filter-form {
    margin-top: 20px;
    margin-bottom: 40px;
  }
`)).define({ MtLayout, MtFilterForm, MtGrid })
}

export default Home