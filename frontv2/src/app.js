import { html, define } from 'hybrids'
import MtRouter from '@/components/router'
import MtNotification from '@/components/notification'

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
