import { refreshToken, logout } from '@/services/oauth'

const safe = (fn, opts = {}) => async (...args) => {
  try {
    return fn(...args).catch(e => {
      console.log({ e })
      return e
    })
  } catch (e) {
    console.log({ e })
    return e
  }
}

const retry = fn => async (...args) => {
  if (!window.localStorage.getItem('accessToken') && !window.localStorage.getItem('refreshToken')) {
    throw new Error('no token')
  }
  return await fn(...args).catch(async e => {
    if (e.error === 'invalid_token' || e.error === 'unauthorized_client') {
      await refreshToken()
      return fn(...args).catch(async e => {
        if (e.error === 'invalid_token' || e.error === 'unauthorized_client') {
          await logout()
          return e
        }
      })
    } else {
      return e
    }
  })
}

export const safeRetry = fn => safe(retry(fn))

export default safe
