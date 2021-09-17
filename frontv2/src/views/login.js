import MtGoogleBtn from '@/components/login/googleBtn'
import MtFacebookBtn from '@/components/login/facebookBtn'
import MtLayout from '@/components/layout'
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
  <mt-layout>
    <p> To save bookmarks you need to login. <strong>No</strong> mail is used/stored/shared. Read the
      <a href="https://github.com/mpech/mangatrack/blob/master/models/userModel.js">source</a> of mangatrack.
    </p>
    <div class="btns">
      <mt-facebook-btn></mt-facebook-btn>
      <mt-google-btn></mt-google-btn>
    </div>
  </mt-layout>
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
  `.define({ MtGoogleBtn, MtFacebookBtn, MtLayout })
}

export default SignIn
