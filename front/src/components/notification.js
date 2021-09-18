import { html, dispatch } from 'hybrids'

const MtNotificationItem = {
  tag: 'mt-notification-item',
  duration: 2000,
  status: '',
  msg: {
    set: (h, v) => v,
    connect (host) {
      const t = setTimeout(() => {
        dispatch(host, 'done', { detail: { id: host.id } })
      }, host.duration + 2000)
      return () => clearTimeout(t)
    }
  },
  render: ({ duration, status, msg }) => (html`
    <div class="${status}">${msg}</div>
  `).style(`
  div {
    padding: 10px;
    color: white;
    animation: fadeinout ${duration}ms;
    opacity: 0;
    box-shadow: 0 4px 10px rgb(0 0 0 / 25%);
    margin-bottom: 10px;
  }
  .success {
    background: #43A047;
  }
  .failure {
    background: #FF5722;
  }

  @keyframes fadeinout {
    0% { opacity: 0; }
    18% { opacity: 0.8; }
    82% { opacity: 0.8; }
    to { opacity: 0; }
  }
  `)
}

const handleDone = (host, e) => {
  const detailId = e.detail.id
  host.notifications = host.notifications.filter(n => n.id !== detailId)
}
// just trying some notif
export default {
  tag: 'MtNotification',
  duration: 4000,
  notifications: {
    set: (h, v) => v,
    connect (host) {
      host.notifications = []
      const fn = (e) => {
        const { status, msg } = e.detail
        host.notifications = [{ id: '' + Date.now(), status, msg }].concat(host.notifications)
      }
      document.body.addEventListener('notify', fn)
      return () => document.body.removeEventListener('notify', fn)
    }
  },
  render: ({ duration, notifications }) => (html`
    ${notifications
      .map(({ id, msg, status }) => html`
        <mt-notification-item id="${id}" ondone="${handleDone}" duration="${duration}" msg="${msg}" status="${status}"></mt-notification-item>
      `.key(id))
    }
`.style(`
  :host {
    display: block;
    position: fixed;
    bottom: 10px;
    width: 300px;
    left: calc((100% - 300px) / 2);
    text-align: center;
    box-sizing: border-box;
  }
`)).define(MtNotificationItem)
}
export const notify = (host, msg) => {
  dispatch(host, 'notify', { composed: true, bubbles: true, detail: { status: 'success', msg } })
}
export const notifyError = (host, msg) => {
  dispatch(host, 'notify', { composed: true, bubbles: true, detail: { status: 'failure', msg } })
}
