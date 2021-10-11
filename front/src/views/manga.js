import { html } from 'hybrids'
import MtChapters, { UNREAD } from '@/components/chapters'
import MtLayout from '@/components/layout'
import MtH1 from '@/components/h1'
import MtFollow from '@/components/follow'
import MtRefresh from '@/components/refresh'
import MtCard from '@/components/card'
import MtTags from '@/components/tags'
import MtTagSelection from '@/components/tagSelection'
import { follow, unfollow, fetchMyMangas, refreshManga } from '@/services/manga'
import { fetchMangaDetail, fetchMe } from '@/api'
import safe, { safeRetry } from '@/utils/safe'
import thumbUrl404 from '@/assets/thumburl_404.png'

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
const refreshChapters = host => refreshManga({ id: host.manga.id, host, onSuccess: setMangaDetail(host) })
const refreshPicture = host => {
  const oldThumbUrl = host.manga.thumbUrl
  refreshManga({
    id: host.manga.id,
    refreshThumb: true,
    host,
    onSuccess: manga => {
      if (manga.thumbUrl === oldThumbUrl && oldThumbUrl !== thumbUrl404) {
      // this is an error image, set it our thumb
        host.manga = { ...host.manga, thumbUrl: thumbUrl404 }
      }
      setMangaDetail(host)(manga)
    },
    onFailure: () => {
      host.manga = { ...host.manga, thumbUrl: thumbUrl404 }
    }
  })
}

const handleTagChange = host => {
  const nameId = host.nameId
  safe(fetchMangaDetail)({ nameId }).then(setMangaDetail(host))
}

export default {
  tag: 'MtManga',
  chapters: [],
  manga: {
    get: (host, last) => last || { description: {} },
    set: (host, v) => v
  },
  user: {},
  myMangas: [],
  nameId: { get: (host, val = window.location.href.match(/mangas\/(.*)/)[1]) => val },
  myManga: ({ myMangas, manga }) => myMangas.find(({ state, mangaId }) => state !== 'deleted' && mangaId === manga.id),
  lastRead: ({ myManga }) => myManga?.num !== undefined ? myManga?.num : UNREAD,
  followed: ({ lastRead }) => lastRead !== UNREAD,
  load: {
    connect (host) {
      const nameId = host.nameId
      fetchMyMangas().then(res => {
        res.items && (host.myMangas = res.items)
      })
      safe(fetchMangaDetail)({ nameId }).then(setMangaDetail(host))

      safeRetry(fetchMe)().then(res => {
        if (res.displayName) {
          host.user = res
        }
      })
      return () => {}
    }
  },
  description ({ manga }) {
    const str = manga?.description?.content || ''
    // decode htmlentities but let vue escape any html stuff
    const txt = document.createElement('textarea')
    txt.innerHTML = str
    return txt.value
  },
  render: ({ manga, myManga, followed, chapters, lastRead, description, user }) => (html`
<mt-layout with-to-top>
  ${manga.name && html`<div class="mangaView">
    <mt-h1>
      <mt-tags tags="${manga.tags}"></mt-tags>
      <mt-tag-selection text="${manga.name}" user="${user}" ontagchange="${handleTagChange}" taggedwords="${manga.taggedWords}">
    </mt-h1>
    <div class="${['header', followed && 'followed']}">
      <mt-card item="${manga}" followednum="${myManga?.num}" onimageerror="${refreshPicture}" nohover>
        ${followed
          ? html`
            <div slot="content">
              <mt-follow
                followData="${manga}"
                followed="${followed}"
                name="${manga.name}"
                onunfollow="${handleUnfollow}"
              ></mt-follow>
              ${user?.admin && html`<mt-refresh onclick="${refreshChapters}"></mt-refresh>`}
            </div>
          `
          : html`<div slot="content">${user?.admin && html`<mt-refresh onclick="${refreshChapters}"></mt-refresh>`}</div>`
        }
      </mt-card>
      <div class="description">
          <blockquote>
            <mt-tag-selection text="${description}" user="${user}" ontagchange="${handleTagChange}" taggedwords="${manga.taggedWords}">
            </mt-tag-selection>
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
  --mt-a-min-width: 200px;
}
figure {
  width: 230px;
  height: 300px;
}
[slot="content"] {
  text-align: center;
}
mt-follow {
  display: inline-block;
  margin: 5px;
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
mt-tags {
  --font-size: 16px;
}
  `.define(MtChapters, MtLayout, MtH1, MtFollow, MtCard, MtRefresh, MtTags, MtTagSelection)
}
