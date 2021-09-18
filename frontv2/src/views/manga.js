import { html } from 'hybrids'
import MtChapters, { UNREAD } from '@/components/chapters'
import MtLayout from '@/components/layout'
import MtH1 from '@/components/h1'
import { follow, fetchMyMangas, refreshManga } from '@/services/manga'
import { fetchMangaDetail } from '@/api'
import safe from '@/utils/safe'

const trackchapter = (host, e) => {
  const onSuccess = (myManga) => {
    fetchMyMangas().then(res => {
      host.myMangas = res.items
    })
  }
  return follow({ host, id: host.manga.id, num: e.detail.num, onSuccess })
}

const setMangaDetail = host => ({ chapters, ...manga }) => {
  host.manga = manga
  const numToMetaChapter = {}

  chapters.sort((a, b) => a.from.localeCompare(b.from)).forEach(({ from, chapters }) => {
    chapters.forEach(chap => {
      numToMetaChapter[chap.num] = numToMetaChapter[chap.num] || { num: chap.num, froms: [], at: 1e15 }
      const metaChapter = numToMetaChapter[chap.num]
      metaChapter.at = Math.min(metaChapter.at, chap.at)
      metaChapter.froms.push(chap)
      chap.klass = `from-${from}`
    })
  })
  host.chapters = Object.values(numToMetaChapter).sort((a, b) => b.num - a.num)
}

const refreshPicture = safe(async (host) => {
  if (!host.manga.thumbUrl) return
  const batch = await refreshManga({ id: host.manga.id, refreshThumb: true })
  if (batch.status === 'OK') {
    safe(fetchMangaDetail)({ nameId: host.manga.nameId }).then(setMangaDetail(host))
  }
})

export default {
  tag: 'MtManga',
  chapters: [],
  manga: {
    get: (host, last) => last || { description: {} },
    set: (host, v) => v
  },
  myMangas: [],
  lastRead: ({ myMangas, manga }) => {
    const myManga = myMangas.filter(m => m.state !== 'deleted').find(my => my.mangaId === manga.id)
    return myManga?.num || UNREAD
  },
  load: {
    connect (host) {
      const nameId = window.location.pathname.match(/mangas\/(.*)/)[1]
      fetchMyMangas().then(res => {
        res.items && (host.myMangas = res.items)
      })
      safe(fetchMangaDetail)({ nameId }).then(setMangaDetail(host))
    }
  },
  description ({ manga }) {
    const str = manga?.description?.content || ''
    // decode htmlentities but let vue escape any html stuff
    const txt = document.createElement('textarea')
    txt.innerHTML = str
    return txt.value
  },
  render: ({ manga, chapters, lastRead, description }) => (html`

<mt-layout>
  ${manga.name && html`<div class="mangaView">
    <mt-h1>${manga.name}</mt-h1>
    <div class="header">
      <figure>
        <img src="${manga.thumbUrl}" onerror="${refreshPicture}"/>
      </figure>
      <div class="description">
        <blockquote>
          ${description}
          <footer>
            <cite>${manga.description.from}</cite>
          </footer>
        </blockquote>
      </div>
    </div>
    <mt-chapters
      manga="${manga}"
      chapters="${chapters}"
      lastRead="${lastRead}"
      ontrackchapter="${trackchapter}">
    </mt-chapters>
  </div>`}
</mt-layout>
  `).style`
.header {
  display: flex;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}
figure {
  width: 230px;
  height: 300px;
  flex-shrink: 0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgb(0 0 0 / 25%);

  padding:0;
  margin:0;
  flex-grow: 0;
}
.description {
  flex-basis: 400px;
  flex-grow: 1;
}
figure img {
  height:100%;
  width:100%;
  object-fit: cover;
}
blockquote {
  padding-left: 20px;
  line-height: 1.5;
  border-radius:1em 1em;
  margin: 0;
}
blockquote footer:before {
  content: "— ";
}
  `.define(MtChapters, MtLayout, MtH1)
}
