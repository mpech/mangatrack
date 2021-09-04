import { html, define } from 'hybrids'
import MtLayout from '/components/layout'
import MtFilterForm from '/components/filterForm'
import MtGrid from '/components/grid'
import { get, fetchMangas, fetchMyMangas, trackManga, untrackManga } from '/api'
import { notify, notifyError } from '/components/notification'

const safe = (fn, opts = {}) => async (...args) => {
  try {
    return fn(...args)
  } catch (e) {
    console.log({ e })
  }
}

const setMangas = host => res => {
  host.mangas = res.items
  host.nextLink = res.links.next
}
const concatMangas = host => res => {
  host.mangas = host.mangas.concat(res.items)
  host.nextLink = res.links.next
}

const onSearch = safe((host, e) => {
  const { detail: { q, minChapters }} = e
  return fetchMangas({ q, minChapters }).then(setMangas(host))
})

const onMore = safe(host => {
  return host.nextLink && get(host.nextLink).then(concatMangas(host))
})

const onFollow = safe(async (host, e) => {
  const { id, lastChap: { num } } = e.composedPath()[0].followData
  try {
    const res = await trackManga({ id, num })
    if (res.error === 'invalid_token') {
      return notifyError(host, `failed to save c${num}`)
    }
    host.myMangas = host.myMangas.concat(res)
    notify(host, `c${num} marked`)
  } catch(e) {
    notifyError(host, `failed to save c${num}`)
  }
})

const onUnfollow = safe(async (host, e) => {
  const { id, name, lastChap: { num } } = e.composedPath()[0].followData
  try {
    const res = await untrackManga({ id, num })
    if (res.error === 'invalid_token') {
      // TODO: retry
      return notifyError(host, `failed to save c${num}`)
    }
    host.myMangas = host.myMangas.filter(m => m.mangaId !== id)
    notify(host, `${name} unfollowed`)
  } catch(e) {
    notifyError(host, `failed to unmark ${name}`)
  }
})

const Home = {
  mangas: {
    connect: host => {
      host.mangas = []
    },
    set: (host, v) => v
  },
  nextLink: {
    set: (host, v) => v
  },
  myMangas: [],
  hasMore: false,

  reload: {
    connect (host) {
      safe(fetchMangas)().then(setMangas(host))
      safe(fetchMyMangas)().then(res => host.myMangas = res.items)
    },
  },
  render: ({ mangas = [], myMangas }) => (html`
    <mt-layout>
      <mt-filter-form onsearch="${onSearch}"></mt-filter-form>
      <mt-grid
        mangas="${mangas}"
        myMangas="${myMangas}"
        onmore="${onMore}"
        onfollow="${onFollow}"
        onunfollow="${onUnfollow}"
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