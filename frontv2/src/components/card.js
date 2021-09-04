import { html } from 'hybrids'
import MtFollow from '/components/follow'
import MtA from '/components/a'
import relativeTime from'dayjs/plugin/relativeTime'
import Manga from '/store/mangas'
// remove dayjs: no need expect fromNow
import dayjs from 'dayjs'
dayjs.extend(relativeTime)

const humanDate = at => {
  let sinceDate = dayjs(at).fromNow()
  sinceDate = sinceDate.replace('minutes', 'min')
  sinceDate = sinceDate.replace('seconds', 'sec')
  return sinceDate
}
const Card = {
  item: {},
  lastItem: ({ item }) => item.lastChap || {},
  link: ({ item: { nameId } }) => '/manga/' + nameId,
  lastHumanDate: ({ lastItem: { at } }) => humanDate(at),
  footerClasses: ({ followed }) => 'footer' + (followed ? ' followed' : ''),
  render: ({ item: { id, thumbUrl, name, num }, followed, lastItem, lastHumanDate, link, footerClasses }) => (html`
<div class="card">
  <mt-a to="${link}">
    <figure>
      <img src="${thumbUrl}"/>
    </figure>
  </mt-a>
  <div class="content">
    <div>
      <h4 title="${name}"><span><mt-a to="${link}">${name}</mt-a></span></h4>
      <div class="chapter">
        <span>
          <mt-a to="${lastItem.url}">c<span>${lastItem.num}</span>↗</mt-a>
        </span>
        <time updatedAt="${lastItem.at}">${lastHumanDate}</time>
      </div>
    </div>
    <hr/>
    <div class="${footerClasses}">
      <mt-follow followData="${{ id, lastItem }}" followed="${followed}" name="${name}"></mt-follow>
      <span class="stats">${num}/${lastItem.num}</span>
    </div>
  </div>
</div>
  `).style(`
.card {
    text-align:left;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgb(0 0 0 / 25%);
}
.card .content {
  padding: 10px;
}
.card img {
    height:100%;
    width:100%;
    object-fit: cover;
}
.card time {
  color: grey;
  font-style: italic;
}
.card h4 {
    color:#1976d2;/*for ellipsis color*/
    margin-top:0.2em;
    margin-bottom:0.2em;
    text-align: center;
}
.card h4>span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display:block;
}
.card figure {
    padding:0;
    margin:0;
    width:100%;
    height: 250px;
}
.card .chapter {
    display: flex;
    justify-content: space-between;
}
.card hr {
  border-top: 1px solid aliceblue;
}
.footer {
  display: flex;
  justify-content: center;
  align-items: center;
}
.footer.followed {
  justify-content: space-between;
}
.footer .stats {
  display: none;
  font-size: 0.8em;
}
.footer.followed .stats {
  display: block;
}
  `).define({ MtFollow, MtA })
}
export default Card
