import MtGoogleBtn from '/components/login/googleBtn'
import MtFacebookBtn from '/components/login/facebookBtn'
import { html } from 'hybrids'
const SignIn = {
  token: {
    connect () {
      const params = new URLSearchParams(window.location.search)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      accessToken && window.localStorage.setItem('accessToken', accessToken)
      refreshToken && window.localStorage.setItem('refreshToken', refreshToken)
      if (accessToken || refreshToken) {
        window.location = '/'
      }
    }
  },
  render: () => html`
  <div>
    <p>
    Login is basically <strong>useless</strong> if you never clear your browser history since your preferences are saved in your browser's localStorage.
    </p>
    <p>
    If however you clear your cache, your tracked mangas will be <strong>lost</strong>.
    </p>

    <p> To save them remote, then you can log by fb or google. <strong>No</strong> mail is used/stored/shared. Read the
      <a href="https://github.com/mpech/mangatrack/blob/master/models/userModel.js">source</a> of mangatrack.
    </p>
    <div class="btns">
      <mt-facebook-btn></mt-facebook-btn>
      <mt-google-btn></mt-google-btn>
    </div>
  </div>
  `.style`
.btns {
  text-align:center;
  margin-top:2em;
  display: flex;
  width: 50%;
  margin: auto;
  margin-top: 40px;
  justify-content: space-around;
  align-items: center;
}
  `.define({ MtGoogleBtn, MtFacebookBtn })
}

export default SignIn
