import { html } from 'hybrids'
import { logout } from '@/services/oauth'

export default {
  tag: 'mt-logout',
  token: {
    value: undefined,
    connect () {
      logout()
      window.location = '/'
    }
  },
  render: () => html`
  <div>
  </div>
`
}
