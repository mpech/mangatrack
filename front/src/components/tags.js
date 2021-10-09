import { html } from 'hybrids'
const MtTags = {
  tag: 'MtTags',
  tags: {},
  render: ({ tags = [] }) => html`
    <span class=${tags.concat('container')}>
      <span class="jn">🇯🇵</span>
      <span class="kr">🇰🇷</span>
      <span class="cn">🇨🇳</span>
    </span>
  `.style`
:host { font-size: var(--font-size);}
.container span {
  display: none;
}
.container.jn .jn,
.container.cn .cn,
.container.kr .kr {
  display: inline;
}
  `
}
export default MtTags
