const routes = {
  mangas: 'http://mangatrackapi/mangas',
  chapters: 'http://mangatrackapi/mangas/{{nameId}}/chapters',
  myMangas: 'http://mangatrackapi/me/mangas/{{nameId}}',
  myMangaSuite: 'http://mangatrackapi/me/mangas'
}
const symbols = {
  ALL_READ: -1
}
const oauth = {
  google_clientId: '936593177518-0spv3m56a0a9nslh6lq669glos9c55na.apps.googleusercontent.com',
  google_redirect_uri: 'http://localhost:4020/oauth/google/callback',
  google_scope: 'profile',
  google_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',

  facebook_clientId: '2145773262189943',
  facebook_redirect_uri: 'http://localhost:4020/oauth/facebook/callback',
  facebook_scope: 'public_profile',
  facebook_endpoint: 'https://www.facebook.com/v5.0/dialog/oauth',

  self_callback: 'http://mangatrack/login'
}
const ops = {
  bug_tracker: 'https://github.com/mpech/mangatrack/issues',
  url_404: '/img/404.jpg'
}
export { routes, symbols, oauth, ops }
