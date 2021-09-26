const errorHandler = require('../lib/errorHandler')
const AtModel = require('../models/oauth/atModel')
const RtModel = require('../models/oauth/rtModel')
const randomstring = require('randomstring')
module.exports.getRefreshToken = async function (token) {
  const tok = await RtModel.findOne({ token }).lean()
  if (!tok) {
    return errorHandler.invalidTokenError()
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

module.exports.revokeToken = async function ({ refreshToken, client, user }) {
  const { deletedCount } = await RtModel.deleteOne({
    userId: user.id,
    token: refreshToken
  })
  return deletedCount
}

/*
Request Authentication
 */
module.exports.getAccessToken = async function (token) {
  const at = await AtModel.findOne({ token }).lean()
  if (!at) {
    return errorHandler.invalidTokenError()
  }
  return {
    accessToken: at.token,
    accessTokenExpiresAt: at.expiresAt,
    client: { id: 'mangatrack' },
    user: { id: at.userId.toString() }
  }
}

module.exports.generateTokens = async function (user) {
  const client = { id: 'mangatrack' }
  const scope = undefined
  const [at, rt] = await Promise.all([
    AtModel.create({ userId: user.id, token: Date.now() + randomstring.generate(27) }),
    RtModel.create({ userId: user.id, token: Date.now() + randomstring.generate(27) })
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
