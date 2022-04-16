import { html, define } from 'hybrids'
import MtRouter from '@/components/router'
import MtNotification from '@/components/notification'
import { defineAll } from '@/utils/hybrids'

const retry = async (delays, fn) => {
  const timeout = t => new Promise(resolve => setTimeout(resolve, t))
  for (const delay of delays) {
    await timeout(delay)
    if (await fn()) {
      return true
    }
  }
}
const restoreScroll = function ({ state }) {
  const pos = state?.location === window.location.toString() && state?.scrollPosition
  if (!pos) { return }
  retry([0, 10, 10, 10], () => {
    return pos.y <= window.document.body.scrollHeight && (window.scrollTo(pos.x, pos.y), true)
  })
}

defineAll(MtRouter, MtNotification)
const App = {
  tag: 'mt-app',
  load: {
    value: undefined,
    connect () {
      window.history.scrollRestoration = 'manual'
      window.addEventListener('popstate', restoreScroll)
      return () => {
        window.removeEventListener('popstate', restoreScroll)
      }
    }
  },
  render: () => html`
    <mt-router></mt-router>
    <mt-notification></mt-notification>
  `.style`
:host {/* declare it on the lightdom */
  --title-font-family: sans-serif;
  --title-color: #4c4e55;
}
  `
}

define(App)
