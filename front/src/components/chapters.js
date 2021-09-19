import dayjs from 'dayjs'
import { html, dispatch } from 'hybrids'
import MtA, { handleScroll } from '@/components/a'
import mangakakalot from '@/assets/mangakakalot.png'
import fanfox from '@/assets/fanfox.png'
import manganelo from '@/assets/manganelo.png'

export const UNREAD = -1

const _ensureTd = (host, e, fn) => {
  if (e.target.nodeName !== 'TD') {
    return
  }
  const td = e.target
  const children = td.parentNode.children
  if (children[children.length - 1] !== td) {
    return
  }
  return fn(td)
}

const rollback = (host, e) => {
  host.lastTracked = host.lastRead
}

const paintSelection = (host, e) => {
  _ensureTd(host, e, td => {
    const num = parseFloat(td.getAttribute('data-num'))
    host.lastTracked = num
  })
}

const select = (host, e) => {
  return _ensureTd(host, e, td => {
    const num = parseFloat(td.getAttribute('data-num'))
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
    <table onmouseout="${rollback}" onmouseover="${paintSelection}" onclick="${select}">
      <thead>
        <th title="chapter">Ch.</th>
        <th>from</th>
        <th>when</th>
        <th>🚚</th>
      </thead>
      <tbody>
      ${chapters.map(({ num, froms, at }) => html`
        <tr id="${'chap' + num}" class="${num <= lastTracked ? 'read' : undefined}">
          <td>c${num}</td>
          <td>
            ${froms.map(from => html`
              <a href="${from.url}" class="${['from', from.klass]}"></a>
            `.key(from.klass + '_' + num))}
          </td>
          <td><time updatedAt="${at}">${dayjs(at).format('YY-MM-DD')}</time></td>
          <td title="mark as read up to there" onmouseleave="${rollback}" data-num="${num}"></td>
        </tr>
      `.key(num))}
      </tbody>
    </table>
  `}
  ${chapters.length === 0 && html`
    <div>
      There are no chapters at the moment.
    </div>
  `}
</div>
  `).style(`
  table {
    border-collapse: collapse;
    border-top: 1px solid #cbcbcb;
    border-bottom: 1px solid #cbcbcb;
  }
  th {
    background: #e0e0e0;
    font-style: bold;
  }
  td, th {
    border-left: 1px solid #cbcbcb;
    padding: 0.5em 1em;
  }
  td:last-child, th:last-child {
    border-right: 1px solid #cbcbcb;
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
  @media only screen and (max-width: 800px) {
    table {
      width: 100%;
    }
  }
  td:last-child {
    cursor: pointer;
  }
  .truckKun svg {
    color: white;
    border-radius: 1em 1em;
    background-color: #209cee;
    padding: 0.3em 0.3em;
  }

  .isekaied {
      background: #CCCCCC;
  }
  .read {
      background: #CCCCCC;
  }
  td:last-child:hover {
      cursor: pointer;
      background: #CCCCCC;
  }
  mt-a {
    display: inline-block;
    margin-bottom: 5px;
  }
  `).define(MtA)
}
