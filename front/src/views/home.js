import { html } from 'hybrids'
import MtLayout from '@/components/layout'
import MtFilterForm from '@/components/filterForm'
import MtGrid from '@/components/grid'
import { fetchMangas, get } from '@/api/index'
import safe from '@/utils/safe'
import { fetchMyMangas } from '@/services/manga'
import { prop, defineAll } from '@/utils/hybrids'
const setMangas = host => res => {
  host.mangas = res.items
  host.nextLink = res.links.next
  host.count = res.count
}
const concatMangas = host => res => {
  host.mangas = host.mangas.concat(res.items)
  host.nextLink = res.links.next
}

const search = safe((host, e) => {
  const { detail: { q, minChapters, jn, cn, kr, untagged } } = e
  const tags = untagged ? 'untagged' : jn && cn && kr ? [] : [jn && 'jn', cn && 'cn', kr && 'kr'].filter(Boolean)
  return fetchMangas({ q, minChapters, tags }).then(setMangas(host))
})

const handleMore = safe(host => {
  return host.nextLink && get(host.nextLink).then(concatMangas(host))
})

defineAll(MtLayout, MtFilterForm, MtGrid)
export default {
  tag: 'mt-home',
  mangas: prop([]),
  nextLink: prop(''),
  count: prop(0),
  myMangas: prop([]),
  hasMore: false,
  init: prop(false),
  load: {
    value: undefined,
    observe (host) {
      // when in /me, no need to fetch for I am hidden
      // assert: I can only browse here via refetch link or back history (meaning I was mounted)
      if (host.load && !host.init) {
        host.init = true
        host.mangas = []
        host.nextLink = ''
        safe(fetchMangas)().then(setMangas(host))
        fetchMyMangas().then(({ items = [] }) => {
          host.myMangas = items
        })
      }
    }
  },
  render: ({ mangas = [], myMangas, nextLink, count }) => (html`
    <mt-layout with-to-top>
      <mt-filter-form onsearch="${search}"></mt-filter-form>
      ${typeof (count) !== 'undefined' ? html`<div class="stats">${count} results</div>` : ''}
      <mt-grid
        mangas="${mangas}"
        myMangas="${myMangas}"
      ></mt-grid>
      <button onclick="${handleMore}" data-next="${Number(!!nextLink)}">${nextLink ? 'Moarrr !' : 'no moar :('}</button>
    </mt-layout>
`.style(`
  :host mt-filter-form {
    margin-top: 20px;
    margin-bottom: 40px;
  }
  .stats { margin-bottom: 20px; color: var(--title-color);}
  
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
  button[data-next="0"] {
    pointer-events: none;
    opacity: 0.5;
  }
  button:hover {
      background-image: linear-gradient(transparent,rgba(0,0,0,.05) 40%,rgba(0,0,0,.1));
  }
`))
}
