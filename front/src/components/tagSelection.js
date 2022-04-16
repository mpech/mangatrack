import { html, dispatch, define } from 'hybrids'
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

const handleClose = (host) => {
  host.word = ''
}

define(MtTags)
const MtTagSelection = {
  tag: 'mt-tag-selection',
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
      // back may have matched from lowercase... better show it even if false positive
      host.tags = host.taggedwords[host.word] || host.taggedwords[host.word.toLowerCase()]
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
        </span><div class="overlay" onclick="${handleClose}"></div>`
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
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.45);
  z-index: 1;
}
.tagged {
  text-decoration: underline;
  color: blue;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0;
}
`)
}
export default MtTagSelection
