import { get, fetchMangas, trackManga, untrackManga, fetchMyMangas as apiFetchMyMangas, refreshManga as apiRefreshManga } from '/api'
import { notify, notifyError } from '/components/notification'
import safe from '/utils/safe'
import { refreshToken, logout } from '/services/oauth'

const retry = fn => async (...args) => {
  if (!localStorage.getItem('accessToken') && !localStorage.getItem('refreshToken')) {
    throw new Error('no token')
  }
  return await fn(...args).catch(async e => {
    if (e.error === 'invalid_token') {
      await refreshToken()
      return fn(...args).catch(async e => {
        if (e.error === 'invalid_token') {
          await logout()
          return e
        }
      })
    } else {
      console.log('e??', e)
      return e
    }
  })
}
const safeRetry = fn => safe(retry(fn))

const safeTrackManga = safeRetry(trackManga)
export const follow = async ({ host, onSuccess, id, num }) => {
  const res = await safeTrackManga({ id, num })
  if (res.error) {
    return notifyError(host, `failed to save c${num}`)
  }
  onSuccess(res)
  notify(host, `c${num} marked`)
}

const safeUntrackManga = safeRetry(untrackManga)
export const unfollow = async ({ host, onSuccess, id, num, name }) => {
  const res = await safeUntrackManga({ id, num })
  if (res.error === 'invalid_token') {
    return notifyError(host, `failed to unfollow ${name}`)
  }
  onSuccess(res)
  notify(host, `${name} unfollowed`)
}

export const fetchMyMangas = safeRetry(apiFetchMyMangas)
export const refreshManga = safeRetry(apiRefreshManga)