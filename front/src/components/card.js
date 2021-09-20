import { html } from 'hybrids'
import MtFollow from '@/components/follow'
import MtA from '@/components/a'
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
export default {
  tag: 'MtCard',
  item: {},
  lastChap: ({ item }) => item.lastChap || {},
  link: ({ item: { nameId } }) => 'mangas/' + nameId,
  lastHumanDate: ({ lastChap: { at } }) => humanDate(at),
  render: ({
    item,
    lastChap,
    lastHumanDate,
    link
  }) => html`
<div class="${item.followed ? 'followed' : undefined}">
  <mt-a to="${link}">
    <figure>
      <img src="${item.thumbUrl}"/>
    </figure>
  </mt-a>
  <div class="content">
    <div>
      <h4 title="${item.name}"><span><mt-a to="${link}">${item.name}</mt-a></span></h4>
      <div class="chapter">
        <span>
          <mt-a to="${lastChap.url}">c<span>${lastChap.num}</span>↗</mt-a>
        </span>
        <time updatedAt="${lastChap.at}">${lastHumanDate}</time>
      </div>
    </div>
  </div>
</div>
  `.style`
:host > div {
  text-align:left;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}
:host > div:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}
:host > div.followed {
  box-shadow: 0 2px 4px rgba(255, 0, 0, 0.45);
}
:host > div.followed:hover {
  box-shadow: 0 3px 8px rgba(255, 0, 0, 0.45);
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

  `.define(MtFollow, MtA)
}
