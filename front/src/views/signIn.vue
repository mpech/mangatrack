<template>
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
</template>

<script>
import GoogleComponent from '../components/googleBtn'
import FacebookComponent from '../components/facebookBtn'

const SignIn = {
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
  }
}

export default SignIn

</script>