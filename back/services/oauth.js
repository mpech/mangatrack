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
module.exports.getRefreshToken = async function (token) {
  const tok = await RtModel.findOne({ token }).lean()
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
}

module.exports.saveToken = async function (token, client, user) {
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

  const [at, rt] = await Promise.all(dfds)
  return {
    accessToken: at.token,
    accessTokenExpiresAt: at.expiresAt,
    refreshToken: rt.token,
    refreshTokenExpiresAt: rt.expiresAt,
    scope: token.scope,
    client: client,
    user: { id: at.userId.toString() }
  }
}

module.exports.revokeToken = async function ({ refreshToken, client, user }) {
  const { deletedCount } = await RtModel.deleteOne({
    userId: user.id,
    token: refreshToken
  })
  return deletedCount
}

module.exports.getClient = async function (clientId, clientSecret) {
  if (clientId !== 'mangatrack') {
    return false
  }
  return {
    id: 'mangatrack',
    grants: ['refresh_token'],
    accessTokenLifetime: config.oauth_accessToken_duration,
    refreshTokenLifetime: config.oauth_refreshToken_duration
  }
}

/*
Request Authentication
 */
module.exports.getAccessToken = async function (token) {
  const at = await AtModel.findOne({ token }).lean()
  if (!at) {
    throw new InvalidTokenError()
  }
  return {
    accessToken: at.token,
    accessTokenExpiresAt: at.expiresAt,
    client: { id: 'mangatrack' },
    user: { id: at.userId.toString() }
  }
}

module.exports.generateTokens = async function (user) {
  const options = { model: module.exports, ...config.oauth2_server }
  const client = { id: 'mangatrack' }
  const scope = undefined
  const prot = GrantType.prototype
  const [at, rt] = await Promise.all([
    prot.generateAccessToken.call(options, client, user, scope).then(at => {
      return AtModel.create({ userId: user.id, token: at })
    }),
    prot.generateRefreshToken.call(options, client, user, scope).then(rt => {
      return RtModel.create({ userId: user.id, token: rt })
    })
  ])
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
}
