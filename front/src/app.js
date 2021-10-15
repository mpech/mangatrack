import { html, define } from 'hybrids'
import MtRouter from '@/components/router'
import MtNotification from '@/components/notification'

window.history.scrollRestoration = 'manual'
const scroll = function ({ state }) {
  const pos = state?.location === window.location.toString() && state?.scrollPosition
  setTimeout(() => pos && window.scrollTo(pos.x, pos.y), 0)
}
window.addEventListener('popstate', scroll)

const App = {
  tag: 'MtApp',
  render: () => html`
    <mt-router></mt-router>
    <mt-notification></mt-notification>
  `.style`
:host {/* declare it on the lightdom */
  --title-font-family: sans-serif;
  --title-color: #4c4e55;
}
  `.define(MtRouter, MtNotification)
}

define(App)
