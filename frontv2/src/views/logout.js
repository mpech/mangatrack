import { html } from 'hybrids'
const Logout = {
  token: {
    connect () {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      location = '/'
    }
  },
  render: () => html`
  <div>
  </div>
`
}

export default Logout
