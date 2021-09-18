const Base = require('./baseFormatter')
class Formatter extends Base {}

Formatter.prototype.formatRefresh = async function ({ accessToken, refreshToken, accessTokenExpiresAt } = {}) {
  return {
    token_type: 'Bearer',
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: accessTokenExpiresAt
  }
}

module.exports = Formatter
