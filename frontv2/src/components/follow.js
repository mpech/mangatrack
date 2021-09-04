import { html, property, dispatch } from 'hybrids'
import MtA from '/components/a'

const onclick = (host, e) => {
  e.preventDefault()
  return dispatch(
    host,
    host.followed ? 'unfollow' : 'follow',
    { composed: true }
  )
}

export default  {
  followed: false,
  followData: property({}),
  name: '',
  title: ({ followed, name }) => `${followed ? 'Untrack' : 'Track'} ${name}`,
  classes: ({ followed }) => [followed && 'followed', 'mt-follow'].filter(Boolean).join(' '),
  render: ({ title, classes }) => html`
    <span onclick="${onclick}" class="${classes}" title="${title}">
      <mt-a href="#">♥</mt-a>
    </span>
  `.style(`
      mt-a:hover {
        --a-hover-color: pink;
      }
      mt-a.followed {
        --a-color: red;
      }
  `).define({ MtA })
}

