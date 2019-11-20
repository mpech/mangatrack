import Vue from './vue.esm.browser.min.js'
import { oauth } from './config.js'

const tpl = `
    <div>
        <a :href="facebookUri" class="facebook">Login via facebook</a>
        <a :href="googleUri" class="google">Login via google</a>
    </div>
`
const SignIn = Vue.component('mt-signin', {
  data () {
    return {
      googleUri: `${oauth.google_endpoint}?response_type=code&\
client_id=${oauth.google_clientId}&\
redirect_uri=${oauth.google_redirect_uri}&\
scope=${oauth.google_scope}&\
state=${oauth.self_callback}`,

      facebookUri: `${oauth.facebook_endpoint}?response_type=code&\
client_id=${oauth.facebook_clientId}&\
redirect_uri=${oauth.facebook_redirect_uri}&\
scope=${oauth.facebook_scope}&\
state=${oauth.self_callback}`
    }
  },
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
  template: tpl
})

export { SignIn }
