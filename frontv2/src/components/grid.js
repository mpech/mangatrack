import { html, define, property, dispatch } from 'hybrids'
import MtCard from '/components/card'

const handleClick = (host) => dispatch(host, 'more')

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
  <button onclick="${handleClick}">Moarrr</button>
`).style`
  :host > div {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-template-rows: repeat(auto-fit, minmax(250px, 1fr));
    grid-gap: 2em;
  }
  button {
    display: block;
    margin: auto;
    margin-top: 40px;
    cursor: pointer;
    padding: .5em 1em;
    border: 1px solid #999;
    background-color: #e6e6e6;
    border-radius: 2px;
  }
  button:hover {
      background-image: linear-gradient(transparent,rgba(0,0,0,.05) 40%,rgba(0,0,0,.1));
  }
`
.define({ MtCard })
}
export default Grid