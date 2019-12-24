<template>
  <div class="loginBtn-wrapper">
    <a :href="uri" style="display:inline-block;" class="google loginBtn loginBtn--google"></a>
    <img style="visibility:hidden;position:absolute;" src="../assets/google/btn_google_signin_dark_focus_web.png"/>
    <img style="visibility:hidden;position:absolute;" src="../assets/google/btn_google_signin_dark_pressed_web.png"/>
  </div>
</template>

<script>
import { oauth } from '../config.js'

export default {
  data () {
    return {
      uri: `${oauth.google_endpoint}?response_type=code&\
client_id=${oauth.google_clientId}&\
redirect_uri=${oauth.google_redirect_uri}&\
scope=${oauth.google_scope}&\
state=${oauth.self_callback}`
    }
  }
}
</script>