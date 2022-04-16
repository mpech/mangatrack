import { html, dispatch } from 'hybrids'

const handleClick = (host, { target }) => {
  const tag = target.dataset.tag
  dispatch(host, 'tagselect', { composed: true, detail: { tag } })
}
const MtTags = {
  tag: 'mt-tags',
  tags: { get: (host, val = []) => val, set: (host, val) => val },
  interactive: false,
  render: ({ tags, interactive }) => (html`
    <span class=${tags.concat('container').concat(interactive ? 'interactive' : [])}>
      <span class="jn" data-tag="jn" onclick="${handleClick}">🇯🇵</span>
      <span class="kr" data-tag="kr" onclick="${handleClick}">🇰🇷</span>
      <span class="cn" data-tag="cn" onclick="${handleClick}">🇨🇳</span>
    </span>
  `).style`
:host { font-size: var(--font-size);}

[data-tag] {
  display: none;
}
.interactive [data-tag] {
  display: inline;
  cursor: pointer;
  opacity: 0.5;
  padding: 3px;
  border-radius: 10%;
  border: 1px solid rgba(0,0,0,0);
}
.interactive [data-tag]:hover {
  background: rgba(255, 165, 0, 0.8);
  border: 1px solid blue;
}
.container.jn [data-tag="jn"],
.container.kr [data-tag="kr"],
.container.cn [data-tag="cn"] {
  display: inline;
  opacity: 1;
}
  `
}
export default MtTags
