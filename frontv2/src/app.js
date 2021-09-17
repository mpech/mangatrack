import { html, define } from 'hybrids'
import MtRouter from '@/components/router'
import MtNotification from '@/components/notification'

const App = {
  tag: 'MtApp',
  render: () => html`
    <mt-router></mt-router>
    <mt-notification></mt-notification>
  `.define(MtRouter, MtNotification)
}

define(App)
