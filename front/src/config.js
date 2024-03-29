export const apiHost = window.location.host.includes('.com')
  ? 'https://mangatrack.nodekoko.com/api'
  : `http://${window.location.host.replace(/:.*$/g, '')}:4020`

export const oauth = {
  google_clientId: '936593177518-0spv3m56a0a9nslh6lq669glos9c55na.apps.googleusercontent.com',
  google_redirect_uri: `${apiHost}/oauth/google/callback`,
  google_scope: 'profile',
  google_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',

  facebook_clientId: '2145773262189943',
  facebook_redirect_uri: `${apiHost}/oauth/facebook/callback`,
  facebook_scope: 'public_profile',
  facebook_endpoint: 'https://www.facebook.com/v5.0/dialog/oauth',

  self_callback: `${window.location.origin}/#/login`
}

export const ops = {
  bug_tracker: 'https://github.com/mpech/mangatrack/issues'
}
