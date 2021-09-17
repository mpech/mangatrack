import { html } from 'hybrids'
import { logout } from '/services/oauth'

const Logout = {
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

export default Logout
