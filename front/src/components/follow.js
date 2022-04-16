import { html, dispatch, define } from 'hybrids'
import MtA from '@/components/a'
import { prop } from '@/utils/hybrids'

const onclick = (host, e) => {
  e.preventDefault()
  return dispatch(
    host,
    host.followed ? 'unfollow' : 'follow',
    { composed: true }
  )
}

define(MtA)
export default {
  tag: 'mt-follow',
  followed: false,
  followData: prop({}),
  name: '',
  title: ({ followed, name }) => `${followed ? 'Untrack' : 'Track'} ${name}`,
  classes: ({ followed }) => [followed && 'followed', 'mt-follow'].filter(Boolean),
  render: ({ title, classes }) => html`
    <span onclick="${onclick}" class="${classes}" title="${title}">
      <mt-a href="#">♥</mt-a>
    </span>
  `.style(`
:host {
  text-align: center;
}
mt-a:hover {
  --a-hover-color: pink;
}
.followed mt-a {
  --a-color: red;
}
  `)
}
