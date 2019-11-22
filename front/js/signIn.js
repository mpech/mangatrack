import Vue from './vue.esm.browser.min.js'
import { oauth } from './config.js'

const FacebookComponent = {
  template: `
<div  class="loginBtn-wrapper">
  <button class="loginBtn loginBtn--facebook" @click="fbOauth()">
    Login with Facebook
  </button>
</div>
`,
  data () {
    return {
      uri: `${oauth.facebook_endpoint}?response_type=code&\
client_id=${oauth.facebook_clientId}&\
redirect_uri=${oauth.facebook_redirect_uri}&\
scope=${oauth.facebook_scope}&\
state=${oauth.self_callback}`
    }
  },
  methods: {
    fbOauth () {
      window.location.href = this.uri
    }
  }
}

const GoogleComponent = {
  data () {
    return {
      uri: `${oauth.google_endpoint}?response_type=code&\
client_id=${oauth.google_clientId}&\
redirect_uri=${oauth.google_redirect_uri}&\
scope=${oauth.google_scope}&\
state=${oauth.self_callback}`
    }
  },
  template: `
  <div class="loginBtn-wrapper">
    <a :href="uri" style="display:inline-block;" class="google loginBtn loginBtn--google"></a>
    <img style="visibility:hidden;position:absolute;" src="/img/google/btn_google_signin_dark_focus_web.png"/>
    <img style="visibility:hidden;position:absolute;" src="/img/google/btn_google_signin_dark_pressed_web.png"/>
  </div>
`
}

const tpl = `
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
    <div style="text-align:center;margin-top:2em;">
      <mt-facebook></mt-facebook>
      <mt-google></mt-google>
    </div>
  </div>
`
const SignIn = Vue.component('mt-signin', {
  mounted () {
    if (this.$route.query.access_token) {
      const accessToken = this.$route.query.access_token
      const refreshToken = this.$route.query.refresh_token
      // I have been authenticated
      this.$store.commit('authenticate', { accessToken, refreshToken })
      this.$store.dispatch('sync', { accessToken, refreshToken })
      return this.$router.push('/')
    }
  },
  components: {
    'mt-facebook': FacebookComponent,
    'mt-google': GoogleComponent
  },
  template: tpl
})

export { SignIn }
