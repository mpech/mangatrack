import { html, define, property, dispatch } from 'hybrids'
import MtCard from '/components/card'

const Grid = {
  mangas: [],
  myMangas: [],
  followedMangas: ({ mangas, myMangas }) => {
    const bag = new Map(myMangas.filter(m => m.state !== 'deleted').map(m => [m.mangaId, m]))
    return mangas.map(m => {
      const myManga = bag.get(m.id)
      return Object.assign({ followed: !!myManga, followedNum: myManga && myManga.num }, m)
    })
  },
  render: ({ followedMangas }) => (html`
  <div>
    ${followedMangas.map(manga => (html`<mt-card item="${manga}"></mt-card>`))}
  </div>
`).style`
  :host > div {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-template-rows: repeat(auto-fit, minmax(250px, 1fr));
    grid-gap: 2em;
  }
`
.define({ MtCard })
}
export default Grid