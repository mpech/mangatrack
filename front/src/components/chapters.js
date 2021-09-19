import dayjs from 'dayjs'
import { html, dispatch } from 'hybrids'
import MtA, { handleScroll } from '@/components/a'
import mangakakalot from '@/assets/mangakakalot.png'
import fanfox from '@/assets/fanfox.png'
import manganelo from '@/assets/manganelo.png'

export const UNREAD = -1

const _ensureDiv = (host, e, fn) => {
  const el = e.target
  return 'istruck' in el.dataset ? fn(el) : undefined
}

const rollback = (host, e) => {
  host.lastTracked = host.lastRead
}

const paintSelection = (host, e) => {
  _ensureDiv(host, e, el => {
    const num = parseFloat(el.dataset.num)
    host.lastTracked = num
  })
}

const select = (host, e) => {
  return _ensureDiv(host, e, el => {
    const num = parseFloat(el.getAttribute('data-num'))
    dispatch(host, 'trackchapter', { detail: { id: host.mangaId, num }, composed: true })
    host.oldTracked = num
  })
}

export default {
  tag: 'MtChapters',
  mangaId: '',
  chapters: [],
  lastRead: {
    get: (host, old) => old || UNREAD,
    set: (host, v) => v,
    observe: (host, value) => {
      host.lastTracked = value
    }
  },
  lastTracked: {
    get: (host, old) => old || UNREAD,
    set: (host, v) => v
  },
  oldTracked: {
    connect (host) {
      host.lastTracked = host.lastRead
    }
  },
  anchor ({ lastRead, chapters }) {
    if (lastRead !== UNREAD) return lastRead
    if (chapters.length) return chapters.slice(-1)[0].num
    return false
  },
  render: ({ chapters, anchor, updatedAt, lastTracked }) => (html`

<div class="mangaChapters">
  ${anchor !== false && html`<mt-a to="${'#chap' + anchor}" onclick="${handleScroll}">
    ↓ Scroll to last read (c${anchor})
    </mt-a>
  `}
  ${chapters.length > 0 && html`
    <div class="grid" onmouseout="${rollback}" onmouseover="${paintSelection}" onclick="${select}">
      <div class="gridhead" title="chapter">Ch.</div>
      <div class="gridhead">from</div>
      <div class="gridhead">when</div>
      <div class="gridhead">🚚</div>
      ${chapters.map(({ num, froms, at }) => html`
        <div class="${num === lastTracked ? 'read' : undefined}" >c${num}</div>
        <div>
          ${froms.map(from => html`
            <a href="${from.url}" class="${['from', from.klass]}"></a>
          `.key(from.klass + '_' + num))}
        </div>
        <div><time updatedAt="${at}">${dayjs(at).format('YY-MM-DD')}</time></div>
        <div
          id="${'chap' + num}"
          title="mark as read up to there"
          onmouseleave="${rollback}"
          data-num="${num}"
          data-istruck
        ></div>
      `.key(num))}
    </div>
  `}
  ${chapters.length === 0 && html`
    <div>
      There are no chapters at the moment.
    </div>
  `}
</div>
  `).style(`
  .gridhead {
    background: #e0e0e0;
    font-weight: bold;
  }
  .grid {
    width: min(500px, 100%);
    display: grid;
    grid-template-columns: repeat(4, auto);
  }
  .grid div {
    box-sizing: border-box;
    display: flex;
    padding: 0.5em;
    border-left: 1px solid #cbcbcb;
    justify-items: center;
    align-items: center;
  }
  .grid div:nth-child(4n + 4) {
    border-right: 1px solid #cbcbcb;
    cursor: pointer;
  }
  .grid .read ~ div, .read {
    background: #CCCCCC;
  }
  a {
    display:block;
  }

  .from {
    width: 1.5em;
    height: 1.5em;
    display: inline-block;
    margin-left: 0.5em;
    margin-right: 0.5em;
    background-size: cover;
  }
  a.from:first-child {
    margin-left: 0px;
  }
  a.from:last-child {
    margin-right: 0px;
  }
  .from-mangakakalot {
    background-image: url('${mangakakalot}');
  }
  .from-fanfox {
    background-image: url('${fanfox}');
  }
  .from-manganelo {
    background-image: url('${manganelo}');
  }
  .truckKun svg {
    color: white;
    border-radius: 1em 1em;
    background-color: #209cee;
    padding: 0.3em 0.3em;
  }
  mt-a {
    display: inline-block;
    margin-bottom: 5px;
  }
  `).define(MtA)
}
