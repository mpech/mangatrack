import Base from './baseFormatter.js'
class Formatter extends Base {
}
Formatter.prototype.formatRefresh = async function ({ accessToken, refreshToken, accessTokenExpiresAt } = {}) {
  return {
    token_type: 'Bearer',
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: accessTokenExpiresAt
  }
}
export default Formatter
