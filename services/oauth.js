const GrantType = require('oauth2-server').AbstractGrantType
const InvalidTokenError = require('oauth2-server').InvalidTokenError
const config = require('../config')
const AtModel = require('../models/oauth/atModel')
const RtModel = require('../models/oauth/rtModel')
/*
https://oauth2-server.readthedocs.io/en/latest/model/overview.html
Refresh Token Grant

    [optional] generateRefreshToken(client, user, scope, [callback])
    saveToken(token, client, user, [callback])
    revokeToken(token, [callback])
    getClient(clientId, clientSecret, [callback])
 */
module.exports.getRefreshToken = function (token) {
  return RtModel.findOne({ token }).lean().then(tok => {
    if (!tok) {
      throw new InvalidTokenError()
    }
    return {
      refreshToken: token,
      refreshTokenExpiresAt: tok.expiresAt,
      client: {
        id: 'mangatrack'
      },
      user: {
        id: tok.userId.toString()
      }
    }
  })
}

module.exports.saveToken = function (token, client, user) {
  const dfds = []
  dfds.push(
    AtModel.create({
      token: token.accessToken,
      userId: user.id,
      expiresAt: token.accessTokenExpiresAt
    })
  )

  if (token.refreshToken) {
    dfds.push(
      RtModel.create({
        token: token.refreshToken,
        expiresAt: token.refreshTokenExpiresAt,
        userId: user.id
      })
    )
  }

  return Promise.all(dfds).then(([at, rt]) => {
    return {
      accessToken: at.token,
      accessTokenExpiresAt: at.expiresAt,
      refreshToken: rt.token,
      refreshTokenExpiresAt: rt.expiresAt,
      scope: token.scope,
      client: client,
      user: { id: at.userId.toString() }
    }
  })
}

module.exports.revokeToken = function ({ refreshToken, client, user }) {
  return RtModel.deleteOne({
    userId: user.id,
    token: refreshToken
  }).then(({ deletedCount }) => {
    return deletedCount
  })
}

module.exports.getClient = function (clientId, clientSecret) {
  if (clientId !== 'mangatrack') {
    return Promise.resolve(false)
  }
  return Promise.resolve({
    id: 'mangatrack',
    grants: ['refresh_token'],
    accessTokenLifetime: config.oauth_accessToken_duration,
    refreshTokenLifetime: config.oauth_refreshToken_duration
  })
}

/*
Request Authentication
 */
module.exports.getAccessToken = function (token) {
  return AtModel.findOne({ token }).lean().then(at => {
    if (!at) {
      throw new InvalidTokenError()
    }
    return {
      accessToken: at.token,
      accessTokenExpiresAt: at.expiresAt,
      client: { id: 'mangatrack' },
      user: { id: at.userId.toString() }
    }
  })
}

module.exports.generateTokens = function (user) {
  const options = { model: module.exports, ...config.oauth2_server }
  const client = { id: 'mangatrack' }
  const scope = undefined
  const prot = GrantType.prototype
  return Promise.all([
    prot.generateAccessToken.call(options, client, user, scope).then(at => {
      return AtModel.create({ userId: user.id, token: at })
    }),
    prot.generateRefreshToken.call(options, client, user, scope).then(rt => {
      return RtModel.create({ userId: user.id, token: rt })
    })
  ]).then(([at, rt]) => {
    // same payload as saveToken
    return {
      accessToken: at.token,
      accessTokenExpiresAt: at.expiresAt,
      refreshToken: rt.token,
      refreshTokenExpiresAt: rt.expiresAt,
      scope,
      client,
      user: { id: at.userId.toString() }
    }
  })
}
