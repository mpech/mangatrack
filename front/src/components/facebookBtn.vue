<template>
  <div class="loginBtn-wrapper">
    <button class="loginBtn loginBtn--facebook" @click="fbOauth()">
      Login with Facebook
    </button>
  </div>
</template>

<script>
import { oauth } from '../config.js'

export default {
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

</script>