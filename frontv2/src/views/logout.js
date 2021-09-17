import { html } from 'hybrids'
import { logout } from '@/services/oauth'

export default {
  tag: 'MtLogout',
  token: {
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
