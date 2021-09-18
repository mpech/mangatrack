import { html } from 'hybrids'
import MtLayout from '@/components/layout'
import MtFilterForm from '@/components/filterForm'
import MtGrid from '@/components/grid'
import { fetchMangas, get } from '@/api'
import safe from '@/utils/safe'
import { follow, unfollow, fetchMyMangas } from '@/services/manga'
const handleFollow = (host, e) => {
  const { id, lastChap: { num } } = e.composedPath()[0].followData
  return follow({
    host,
    id,
    num,
    onSuccess: res => {
      host.myMangas = host.myMangas.concat(res)
    }
  })
}
const handleUnfollow = (host, e) => {
  const { id, lastChap: { num }, name } = e.composedPath()[0].followData
  return unfollow({
    host,
    id,
    num,
    name,
    onSuccess: () => {
      host.myMangas = host.myMangas.filter(m => m.mangaId !== id)
    }
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
  const { detail: { q, minChapters } } = e
  return fetchMangas({ q, minChapters }).then(setMangas(host))
})

const handleMore = safe(host => {
  return host.nextLink && get(host.nextLink).then(concatMangas(host))
})

export default {
  tag: 'mtHome',
  mangas: { set: (h, v) => v },
  nextLink: { set: (host, v) => v },
  myMangas: [],
  hasMore: false,
  load: {
    connect (host) {
      host.mangas = []
      host.nextLink = ''
      safe(fetchMangas)().then(setMangas(host))
      fetchMyMangas().then(({ items = [] }) => {
        host.myMangas = items
      })
    }
  },
  render: ({ mangas = [], myMangas }) => html`
    <mt-layout>
      <mt-filter-form onsearch="${search}"></mt-filter-form>
      <mt-grid
        mangas="${mangas}"
        myMangas="${myMangas}"
        onfollow="${handleFollow}"
        onunfollow="${handleUnfollow}"
      ></mt-grid>
      <button onclick="${handleMore}">Moarrr</button>
    </mt-layout>
`.style(`
  :host mt-filter-form {
    margin-top: 20px;
    margin-bottom: 40px;
  }
  
  button {
    display: block;
    margin: auto;
    margin-top: 40px;
    cursor: pointer;
    padding: .5em 1em;
    border: 1px solid #999;
    background-color: #e6e6e6;
    border-radius: 2px;
  }
  button:hover {
      background-image: linear-gradient(transparent,rgba(0,0,0,.05) 40%,rgba(0,0,0,.1));
  }
`).define(MtLayout, MtFilterForm, MtGrid)
}
