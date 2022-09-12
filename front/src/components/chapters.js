import dayjs from 'dayjs'
import { html, dispatch, define } from 'hybrids'
import MtA, { handleScroll } from '@/components/a'
import { prop } from '@/utils/hybrids'

export const UNREAD = -1

const _ensureDiv = (host, e, fn) => {
  const el = e.target
  return 'istruck' in el.dataset ? fn(el) : undefined
}
const select = (host, e) => {
  return _ensureDiv(host, e, el => {
    const num = parseFloat(el.getAttribute('data-num'))
    dispatch(host, 'trackchapter', { detail: { id: host.mangaId, num }, composed: true })
    host.oldTracked = num
  })
}

define(MtA)
export default {
  tag: 'mt-chapters',
  mangaId: '',
  chapters: prop([]),
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
    value: undefined,
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
    <div class="grid"><!-- waiting for subgrid... -->
      <div class="col">
        <div class="gridhead" title="chapter">Ch.
        </div>
        ${chapters.map(({ num, froms, at }) => html`
          <div>c${num}</div>
        `.key(num))}
      </div>

      <div class="col">
        <div class="gridhead" title="from">From
        </div>
        ${chapters.map(({ num, froms, at }) => html`
          <div>
            ${froms.map(from => html`
              <a href="${from.url}" class="${['from', from.klass]}"></a>
            `.key(from.klass + '_' + num))}
          </div>
        `.key(num))}
      </div>
      <div class="col">
        <div class="gridhead" title="at">At
        </div>
        ${chapters.map(({ num, froms, at }) => html`
          <div><time updatedAt="${at}">${dayjs(at).format('YY-MM-DD')}</time></div>
        `.key(num))}
      </div>

      <div class="col tracker" onclick="${select}">
        <div class="gridhead">🚚
        </div>
        ${chapters.map(({ num, froms, at }) => html`
          <div class="${num === lastTracked ? 'read' : undefined}"
            id="${'chap' + num}"
            title="mark as read up to there"
            data-num="${num}"
            data-istruck
          ></div>
        `.key(num))}
      </div>
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
    border: 1px solid #cbcbcb;
  }
  .col {
    display: flex;
    flex-direction: column;
  }
  .col:nth-child(2) {
    border-left: 1px solid #cbcbcb;
    border-right: 1px solid #cbcbcb;
  }
  .col:nth-child(3) { border-right: 1px solid #cbcbcb; }
  .col > div {
    height: 40px;
  }
  .col > div {
    box-sizing: border-box;
    display: flex;
    padding: 0.5em;
    justify-items: center;
    align-items: center;
  }
  .tracker > :not(.gridhead) {
    cursor: pointer;
  }
  /* if read is given, mark from read to bottom */
  .tracker:not(:hover) .read ~ *,
  .tracker:not(:hover) .read,
  .gridhead:hover ~ .read ~ *,
  .gridhead:hover ~ .read
  {
    background: #ccc;
  }
  /* when hover, remove any read stuff and mark from hover to bottom */
  .tracker > :hover:not(.gridhead)::before {
    content: '🚚';
  }
  .tracker > :hover:not(.gridhead) {
    background: conic-gradient(from 20deg at 0% 100%, #eee, #ccc 70deg, #eee);
  }
  .tracker > :hover:not(.gridhead) ~ * {
    background: #ccc;
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
    background-image: url(/assets/mangakakalot.png);
  }
  .from-fanfox {
    background-image: url(/assets/fanfox.png);
  }
  .from-manganelo {
    background-image: url(/assets/manganelo.png);
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
  `)
}
