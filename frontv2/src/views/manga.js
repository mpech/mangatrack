import { html } from 'hybrids'
import MtChapters, { UNREAD } from '@/components/chapters'
import MtLayout from '@/components/layout'
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
  <div class="mangaView">
    <h1>${manga.name}</h1>
    <div class="header">
      <div>
        <figure>
          <img src="${manga.thumbUrl}" onerror="${refreshPicture}"/>
        </figure>
      </div>
      <div>
        <div class="description">
          <h3>Description</h3>
          <blockquote>
            ${description}
            <footer>
              <cite>${manga.description.from}</cite>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
    <mt-chapters
      manga="${manga}"
      chapters="${chapters}"
      lastRead="${lastRead}"
      ontrackchapter="${trackchapter}">
    </mt-chapters>
  </div>
</mt-layout>
  `).style`
.mangaView .header {
  display: flex;
  margin-bottom: 20px;
}
.mangaView .header > div:first-child {
  width: 20%;
  flex-shrink: 0;
  margin-right: 30px;
}
.mangaView figure{
    padding:0;
    margin:0;
    width:100%;
    height:15em;
}
.mangaView figure img{
    height:100%;
    width:100%;
    object-fit: cover;
}
.mangaView .pure-g > div {
  box-sizing: border-box;
  padding: 1em;
}
.mangaView .description-from {
  text-align:right;
}
.mangaView h3 {
  margin-top: 0;
}
.mangaView .pure-g > div {
  margin-bottom: 2em;
}

blockquote {
  padding: .75em .5em .75em 1em;
  background: #dddddd;
  line-height: 1.5;
  border-radius:1em 1em;
}
blockquote:before {
  height: 0;
  content: "“";
  font: italic 300%/1 Cochin,Georgia,"Times New Roman", serif;
  color: #999;
}
blockquote footer:before {
  content: "— ";
}
@media only screen and (max-width: 1024px) {
  blockquote {
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
  }
}
}
  `.define({ MtChapters, MtLayout })
}
