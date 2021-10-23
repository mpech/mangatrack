import { html, dispatch } from 'hybrids'
import MtFollow from '@/components/follow'
import MtA from '@/components/a'
import MtTags from '@/components/tags'
import relativeTime from 'dayjs/plugin/relativeTime'
// remove dayjs: no need expect fromNow
import dayjs from 'dayjs'
dayjs.extend(relativeTime)

const humanDate = at => {
  let sinceDate = dayjs(at).fromNow()
  sinceDate = sinceDate.replace('minutes', 'min')
  sinceDate = sinceDate.replace('seconds', 'sec')
  return sinceDate
}

const handleError = (host, e) => dispatch(e.target, 'imageerror', { composed: true, bubbles: true })
const UNDEFINED_NUM = -1000
export default {
  tag: 'MtCard',
  item: {},
  followednum: UNDEFINED_NUM,
  lastChap: ({ item }) => item.lastChap || {},
  link: ({ item: { nameId } }) => 'mangas/' + nameId,
  lastHumanDate: ({ lastChap: { at } }) => humanDate(at),
  upToDate: ({ followednum, lastChap: { num } }) => followednum === num,
  nohover: false,
  render: ({
    item,
    nohover,
    followednum,
    lastChap,
    lastHumanDate,
    upToDate,
    link
  }) => (html`
<div class="${[
  !isNaN(followednum) && 'followed',
  upToDate && 'up-to-date',
  nohover && 'nohover'
  ]}">
  <mt-a to="${link}">
    <figure>
      <img referrerpolicy="same-origin" src="${item.thumbUrl}" onerror="${handleError}"/>
    </figure>
  </mt-a>
  <slot name="content">
    <div class="content">
      <h4 title="${item.name}"><span><mt-tags tags="${item.tags}"></mt-tags><mt-a to="${link}">${item.name}</mt-a></span></h4>
      <div class="chapter">
        <span>
          <mt-a to="${lastChap.url}">c<span>${lastChap.num}</span>↗</mt-a>
        </span>
        <time updatedAt="${lastChap.at}">${lastHumanDate}</time>
      </div>
    </div>
  </slot>
</div>
  `.style`
:host {
  min-width: var(--mt-a-min-width);
}
:host > div {
  text-align:left;
  border-radius: 20px;
  overflow: hidden;
  --base-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  box-shadow: var(--base-shadow);
}
:host > div:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}
:host > div.followed {
  --base-shadow: 0 2px 4px rgba(255, 0, 0, 0.45);
  box-shadow: var(--base-shadow);
}
:host > div.followed:hover {
  box-shadow: 0 3px 8px rgba(255, 0, 0, 0.45);
}
:host > div.followed.up-to-date {
  --base-shadow: 0 2px 4px rgba(0, 255, 0, 0.45);
  box-shadow: var(--base-shadow);
}
:host > div.followed.up-to-date:hover {
  box-shadow: 0 3px 8px rgba(0, 255, 0, 0.45);
}
.nohover.nohover:hover:hover {
  box-shadow: var(--base-shadow);
}
.content {
  padding: 10px;
}
img {
  height:100%;
  width:100%;
  object-fit: cover;
}
time {
  color: grey;
  font-style: italic;
}
h4 {
  color:#1976d2;/*for ellipsis color*/
  margin-top:0.2em;
  margin-bottom:0.2em;
  text-align: center;
}
h4 > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display:block;
}
figure {
  padding:0;
  margin:0;
  width:100%;
  height: 250px;
}
.chapter {
  display: flex;
  justify-content: space-between;
}

  `).define(MtFollow, MtA, MtTags)
}
