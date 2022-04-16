import { html } from 'hybrids'
import MtLayout from '@/components/layout'
import MtGrid from '@/components/grid'
import MtH1 from '@/components/h1'
import { follow, unfollow, fetchMyMangas } from '@/services/manga'
import { prop, defineAll } from '@/utils/hybrids'
const handleClick = (host, e) => {
  host.tabClass = e.target.name
}

const handleFollow = (host, e) => {
  const { id, lastChap: { num } } = e.composedPath()[0].followData
  return follow({
    host,
    id,
    num,
    onSuccess: res => {
      host.myPopulatedMangas = host.myPopulatedMangas.concat(res)
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
      host.myPopulatedMangas = host.myPopulatedMangas.filter(m => m.mangaId !== id)
    }
  })
}

defineAll(MtLayout, MtGrid, MtH1)
const Me = {
  tag: 'mt-me',
  myPopulatedMangas: prop([]),
  newMangas: {
    get ({ myPopulatedMangas }) {
      return myPopulatedMangas
        .filter(x => x.num < x?.manga?.lastChap?.num)
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
  tabClass: prop('new-mangas'),
  load: {
    value: undefined,
    connect (host) {
      host.myPopulatedMangas = []
      fetchMyMangas({ populated: true }).then(({ items }) => {
        host.myPopulatedMangas = items.filter(x => x.state !== 'deleted')
      })
    }
  },
  render: ({ upToDateMangas, newMangas, myPopulatedMangas, tabClass }) => (html`
    <mt-layout with-to-top>
      <div>
        <mt-h1>Tracked mangas</mt-h1>
        <nav class="${[tabClass, 'tabs']}">
          <button name="new-mangas" onclick="${handleClick}">new</button>
          <button name="uptodate-mangas" onclick="${handleClick}">up to date</button>
        </nav>
        <div class="${tabClass}">
          <mt-grid
            data-name="new-mangas"
            mangas="${newMangas}"
            myMangas="${myPopulatedMangas}"
            onfollow="${handleFollow}"
            onunfollow="${handleUnfollow}"
          ></mt-grid>

          <mt-grid
            data-name="uptodate-mangas"
            mangas="${upToDateMangas}"
            myMangas="${myPopulatedMangas}"
            onfollow="${handleFollow}"
            onunfollow="${handleUnfollow}"
          ></mt-grid>
        </div>
      </div>
    </mt-layout>
  `).style`
.tabs {
  display: flex;
  margin-bottom: 20px;
}
.tabs button {
  padding: 10px;
  border: none;
  margin: 10px 1px;
  color: white;
  min-width: 100px;
  background: #A0A0A0;
  box-shadow: 0 1px 3px rgb(0 0 0 / 30%);
  cursor: pointer;
}
.tabs button:hover {
  opacity: 0.8;
}
.tabs.new-mangas [name='new-mangas'], .tabs.uptodate-mangas [name='uptodate-mangas'] {
  border-bottom: 1px solid rgb(255, 128, 128);
}
.new-mangas [data-name="uptodate-mangas"], .uptodate-mangas [data-name="new-mangas"] {
  display: none;
}
  `
}
export default Me
