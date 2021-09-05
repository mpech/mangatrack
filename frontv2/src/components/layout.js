import { html, define } from 'hybrids'

const onclick = (host, e) => host.path = e.target.pathname
const Layout = {
  path: {
    get: () => location.pathname,
    set: (host, val) => val
  },
  isLogged: () => !!localStorage.getItem('accessToken'),
  activeClass: ({ path }) => path === '/' ? 'home' : path.replace('/', ''),
  loggedClass: ({ isLogged }) => isLogged ? 'logged' : 'unlogged',
  classes: ({ activeClass, loggedClass }) => [activeClass, loggedClass].filter(Boolean),
  render: ({ classes }) => (html`
    <div class="${classes}" onclick="${onclick}">
      <a data-name="home" href="/">MangaTrack</a>
      <a data-name="me" href="/me" title="my space">Me</a>
      <a data-name="login" href="/login" title="Mainly sync your tracked stuff">Login</a>
      <a data-name="logout" href="/logout">Logout</a>
    </div>
    <div>
      <slot/>
    </div>
  `).style`
    :host {
      display: block;
    }
    :host > div:nth-child(2) {
      padding: 32px;
    }
    a {
      margin-right: 32px;
      text-transform: uppercase;
      color: grey;
      text-decoration: none;
      font-family: sans-serif;
    }
    a:hover {
      text-decoration: underline;
    }
    .logged [data-name="login"], .unlogged [data-name="logout"] {
      display: none;
    }
    .home [data-name="home"],
    .me [data-name="me"],
    .login [data-name="login"],
    .logout [data-name="logout"] {
      color: #ff8080;
    }
  `
}
export default Layout