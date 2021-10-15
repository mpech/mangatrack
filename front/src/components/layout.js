import { html } from 'hybrids'
import MtToTop from '@/components/toTop'
import MtA from '@/components/a'
const onclick = (host, e) => {
  host.path = e.target.pathname
}

export default {
  tag: 'MtLayout',
  withToTop: false,
  path: {
    get: () => window.location.pathname,
    set: (host, val) => val
  },
  isLogged: () => !!window.localStorage.getItem('accessToken'),
  activeClass: ({ path }) => path === '/' ? 'home' : path.replace('/', ''),
  loggedClass: ({ isLogged }) => isLogged ? 'logged' : 'unlogged',
  classes: ({ activeClass, loggedClass }) => [activeClass, loggedClass].filter(Boolean),
  render: ({ classes, withToTop }) => (html`
    <div class="${classes}" onclick="${onclick}">
      <mt-a data-name="home" to="${window.location.origin}">MangaTrack</mt-a>
      <mt-a data-name="me" to="/me" title="my space">Me</mt-a>
      <mt-a data-name="login" to="/login" title="Mainly sync your tracked stuff">Login</mt-a>
      <mt-a data-name="logout" to="/logout">Logout</mt-a>
    </div>
    <div>
      <slot/>
    </div>
    ${withToTop && html`<mt-to-top></mt-to-top>`}
  `).style`
:host {
  display: block;
}
:host > div:nth-child(2) {
  padding: 32px;
}

@media only screen and (max-width: 800px) {
  :host > div:nth-child(2) {
    padding: 8px;
  }
}
mt-a {
  margin-right: 32px;
  text-transform: uppercase;
  color: grey;
  font-family: sans-serif;
  --a-color: grey;
}
.logged [data-name="login"], .unlogged [data-name="logout"], .unlogged [data-name="me"] {
  display: none;
}
.home [data-name="home"],
.me [data-name="me"],
.login [data-name="login"],
.logout [data-name="logout"] {
  color: #ff8080;
}
  `.define(MtToTop, MtA)
}
