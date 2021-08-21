import { html, define } from 'https://unpkg.com/hybrids@^5'

const onclick = (host, e) => host.path = e.target.pathname
const Layout = {
  path: {
    get: () => location.pathname,
    set: (host, val) => (console.log('val', val), val)
  },
  activeClass: ({ path }) => (console.log('reload???', path), path === '/' ? 'home' : path.replace('/', '')),
  adminClass: ({ isAdmin }) => isAdmin ? 'admin' : '',
  loggedClass: ({ isLogged }) => isLogged ? 'logged' : '',
  classes: ({ activeClass, adminClass, loggedClass }) => [activeClass, adminClass, loggedClass].filter(Boolean).join(''),
  render: ({ classes }) => html`
    <div class="${classes}" onclick="${onclick}">
      <a data-name="home" href="/">MangaTrack</a>
      <a data-name="me" href="/me" title="my space">Me</a>
      <a data-name="admin" href="/admin">Admin</a>
      <a data-name="login" href="/login" title="Mainly sync your tracked stuff">Login</a>
      <a data-name="logout" href="/logout">Logout</a>
    </div>
    <slot/>
  `.style(`
    :host {
      display: block;
      margin-left: 20px;
      margin-right: 20px;
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
    .hide {
      display: none;
    }
    .home [data-name="home"],
    .me [data-name="me"],
    .admin [data-name="admin"],
    .login [data-name="login"],
    .logout [data-name="logout"] {
      color: #ff8080;
    }
  `)
}
export default Layout