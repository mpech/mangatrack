import { html } from 'hybrids'
import MtChapters, { UNREAD } from '@/components/chapters'
import MtLayout from '@/components/layout'
import MtH1 from '@/components/h1'
import MtFollow from '@/components/follow'
import MtCard from '@/components/card'
import { follow, unfollow, fetchMyMangas, refreshManga } from '@/services/manga'
import { fetchMangaDetail } from '@/api'
import safe from '@/utils/safe'

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
  myManga: ({ myMangas, manga }) => myMangas.find(({ state, mangaId }) => state !== 'deleted' && mangaId === manga.id),
  lastRead: ({ myManga }) => myManga?.num !== undefined ? myManga?.num : UNREAD,
  followed: ({ lastRead }) => lastRead !== UNREAD,
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
  render: ({ manga, myManga, followed, chapters, lastRead, description }) => (html`
<mt-layout with-to-top>
  ${manga.name && html`<div class="mangaView">
    <mt-h1>${manga.name}</mt-h1>
    <div class="${['header', followed && 'followed']}">
      <mt-card item="${manga}" followedNum="${myManga?.num}" onimageerror="${refreshPicture}">
        ${followed
          ? html`
            <mt-follow
              slot="content"
              followData="${manga}"
              followed="${followed}"
              name="${manga.name}"
              onunfollow="${handleUnfollow}"
            ></mt-follow>`
          : html`<span slot="content"></span>`
        }
      </mt-card>
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
mt-card {
  flex-shrink: 0;
  flex-grow: 0;
}
figure {
  width: 230px;
  height: 300px;
}
mt-follow {
  display: block;
  margin: auto;
  padding: 5px;
}

.description {
  flex-basis: 400px;
  flex-grow: 1;
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
  `.define(MtChapters, MtLayout, MtH1, MtFollow, MtCard)
}
