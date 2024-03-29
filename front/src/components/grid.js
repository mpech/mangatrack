import { html, define } from 'hybrids'
import MtCard from '@/components/card'
import { prop } from '@/utils/hybrids'

define(MtCard)
export default {
  tag: 'mt-grid',
  mangas: prop([]),
  myMangas: prop([]),
  followedMangas: {
    get ({ mangas, myMangas }) {
      const bag = new Map(myMangas.filter(m => m.state !== 'deleted').map(m => [m.mangaId, m]))
      return mangas.map(manga => {
        const myManga = bag.get(manga.id)
        return ({ manga, followedNum: myManga && myManga.num })
      })
    }
  },
  render: ({ followedMangas, mangas }) => (html`
  <div>
    ${followedMangas.map(({ manga, followedNum }) => (html`<mt-card item="${manga}" followednum="${followedNum}"></mt-card>`.key(manga.id)))}
  </div>
`).style`
  :host > div {
    display: grid;
    justify-content: space-around;
    grid-template-columns: repeat(auto-fit, minmax(250px, 300px));
    gap: 2em;
  }

  @media only screen and (max-width: 800px) {
    :host > div {
      grid-template-columns: repeat(auto-fit, minmax(100px, 150px));
      gap: 1em;
    }
  }
`
}
