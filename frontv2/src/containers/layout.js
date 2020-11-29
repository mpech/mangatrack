import { html, define } from 'hybrids'

const Layout = {
  render: () => html`
    <div class="pure-menu pure-menu-horizontal">
      <a href="/" class="pure-menu-heading pure-menu-link"
        :class="{active: active.home}"
      >MangaTrack</a>

      <a href="/me"
        class="pure-menu-heading pure-menu-link"
        :class="{active: active.me}"
        title="my space"
      >Me</a>

      <a href="/admin" 
        class="pure-menu-heading pure-menu-link admin"
        :class="{hide: !logged, active: active.admin}"
      >Admin</a>

      <a href="/login" 
        class="pure-menu-heading pure-menu-link login" 
        :class="{hide:logged, active: active.login}"
        title="Mainly sync your tracked stuff"
      >Login</a>

      <a href="/login" 
        class="pure-menu-heading pure-menu-link logout"
        :class="{hide:!logged, active: active.login}"
      >Logout</a>
    </div>
    <slot/>
  `
}
export default Layout