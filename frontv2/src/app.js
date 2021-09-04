import { html, define } from 'hybrids'
import MtRouter from '/views/router'
import MtNotification from '/components/notification'

const App = {
  render: () => html`
    <mt-router></mt-router>
    <mt-notification></mt-notification>
  `.define({ MtRouter, MtNotification })
}

define('mt-app', App)
