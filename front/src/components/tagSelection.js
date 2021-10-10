import { html, dispatch } from 'hybrids'
import MtTags from '@/components/tags'
import debounce from 'debounce'
import { putTags } from '@/services/tag'

const handleSelection = (host, ev) => {
  const position = { x: ev.offsetX, y: ev.offsetY }
  if (!host.user?.admin) return
  const word = window.getSelection().toString()
  if (!word || word.match(/\s/)) {
    host.word = ''
    return
  }
  host.word = word
  host.wordPosition = position
}
const myDebounce = debounce(host => {
  const { word, tags } = host
  // display loader ?
  return putTags({
    host,
    tags,
    word,
    onSuccess: () => {
      dispatch(host, 'tagchange', { composed: true })
    }
  })
})
const handleTagSelect = (host, { detail: { tag } }) => {
  const tags = host.tags.includes(tag) ? host.tags.filter(x => x !== tag) : host.tags.concat(tag)
  host.tags = tags
  myDebounce(host)
}

const MtTagSelection = {
  tag: 'mtTagSelection',
  user: { get: (host, val = {}) => val, set: (host, val) => val },
  taggedwords: { get: (host, val = {}) => val, set: (host, val) => val },
  regWords: {
    get: ({ taggedwords }) => {
      const words = [...new Set(Object.keys(taggedwords))]
      return new RegExp(`(?<=\\W|^)(${words.join('|')})(?=\\W|$)`, 'igm')
    }
  },
  word: {
    get: (host, val = '') => val,
    set: (host, val) => val,
    observe: (host, val) => {
      host.tags = host.taggedwords[host.word]
    }
  },
  text: { get: (host, val = '') => val, set: (host, val) => val },
  dirtyText: { get: ({ text, regWords }) => (text.replace(regWords, '<span class="tagged">$1</span>')) },
  tags: { get: (host, val = []) => val, set: (host, val) => val },
  wordPosition: { get: (host, val = {}) => val, set: (host, val) => val },

  render: ({ user, word, tags, wordPosition, dirtyText }) => (html`
    <div onmouseup="${handleSelection}" innerHTML="${dirtyText}">
    </div>
    ${word
      ? html`
        <span style="--posy:${wordPosition.x - 10}px; --posx:${wordPosition.y + 15}px;">
          <mt-tags interactive tags="${tags}" ontagselect="${handleTagSelect}"></mt-tags>
        </span>`
      : ''}
  `).style(`
:host { position: relative; display: inline-block;}
:host > span {
  position: absolute;
  display: block;
  top: var(--posx);
  left: var(--posy);
  background: white;
  padding: 5px;
  border-radius: 10%;
  opacity: 0.9;
}
.tagged {
  text-decoration: underline;
  color: blue;
}
`).define(MtTags)
}
export default MtTagSelection
