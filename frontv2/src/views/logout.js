import { html } from 'hybrids'
import { logout } from '/services/oauth'

const Logout = {
  token: {
    connect () {
      logout()
      location = '/'
    }
  },
  render: () => html`
  <div>
  </div>
`
}

export default Logout
