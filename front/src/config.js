let api
if (window.location.host.includes('.com')) {
  api = 'https://mangatrackapi.nodekoko.com'
} else {
  api = `http://${window.location.host.replace(/:.*$/g, '')}:4020`
}
const routes = {
  mangas: `${api}/mangas`,
  mangaDetail: `${api}/mangas/{{nameId}}`,
  me: `${api}/me`,
  myMangas: `${api}/me/mangas/{{mangaId}}`,
  myMangaSuite: `${api}/me/mangas`,
  oauth: `${api}/oauth/token`,
  batches: `${api}/admin/batches`
}
const oauth = {
  google_clientId: '936593177518-0spv3m56a0a9nslh6lq669glos9c55na.apps.googleusercontent.com',
  google_redirect_uri: `${api}/oauth/google/callback`,
  google_scope: 'profile',
  google_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',

  facebook_clientId: '2145773262189943',
  facebook_redirect_uri: `${api}/oauth/facebook/callback`,
  facebook_scope: 'public_profile',
  facebook_endpoint: 'https://www.facebook.com/v5.0/dialog/oauth',

  self_callback: `${window.location.origin}/login`
}
const ops = {
  bug_tracker: 'https://github.com/mpech/mangatrack/issues',
  url_404: '/img/404.jpg'
}
export { routes, oauth, ops }
