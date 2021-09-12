import { html } from 'hybrids'
import MtLayout from '/components/layout'
import MtGrid from '/components/grid'
import safe from '/utils/safe'
import { fetchMangas } from '/api'
import { follow, unfollow, fetchMyMangas } from '/services/manga'

const handleFollow = (host, e) => {
  const { id, lastChap: { num } } = e.composedPath()[0].followData
  return follow({
    host,
    id,
    num,
    onSuccess: res => host.myMangas = host.myMangas.concat(res)
  })
}
const handleUnfollow = (host, e) => {
  const { id, lastChap: { num }, name } = e.composedPath()[0].followData
  return unfollow({
    host,
    id,
    num,
    name,
    onSuccess: () => host.myMangas = host.myMangas.filter(m => m.mangaId !== id)
  })
}
const Me = {
  myPopulatedMangas: {
    set: (h, v) => v
  },
  newMangas: {
    get ({ myPopulatedMangas }) {
      return myPopulatedMangas
        .filter(x =>  x.num < x?.manga?.lastChap?.num)
        .sort((a, b) => b.manga?.lastChap?.at - a.manga?.lastChap?.at)
        .map(m => m.manga)
    },
    set: (h, v) => v
  },
  upToDateMangas: {
    get ({ newMangas, myPopulatedMangas }) {
      const newMangasSet = new Set(newMangas.map(m => m.id))
      return myPopulatedMangas
        .filter(x => !newMangasSet.has(x.mangaId))
        .sort((a, b) => b.manga?.lastChap?.at - a.manga?.lastChap?.at)
        .map(m => m.manga)
    },
    set: (h, v) => v
  },
  load: {
    connect (host) {
      host.myPopulatedMangas = []
      fetchMyMangas({ populated: true }).then(({ items }) => {
        host.myPopulatedMangas = items.filter(x => x.state !== 'deleted')
      })
    },
  },
  render: ({ upToDateMangas, newMangas, myPopulatedMangas }) => (html`
    <mt-layout>
      <div>
        <h1>Tracked mangas</h1>
        <h2>Updates</h2>
        <mt-grid
          mangas="${newMangas}"
          myMangas="${myPopulatedMangas}"
          onfollow="${handleFollow}"
          onunfollow="${handleUnfollow}"
        ></mt-grid>
        <hr/>
        <h2>Up to date</h2>
        <mt-grid
          mangas="${upToDateMangas}"
          myMangas="${myPopulatedMangas}"
          onfollow="${handleFollow}"
          onunfollow="${handleUnfollow}"
        ></mt-grid>
      </div>
    </mt-layout>
  `).style`
    hr {
      margin-top: 60px;
      margin-bottom: 40px;
    }
  `.define({ MtLayout, MtGrid })
}
export default Me