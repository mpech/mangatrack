import { get, fetchMangas, trackManga, untrackManga, fetchMyMangas as apiFetchMyMangas } from '/api'
import { notify, notifyError } from '/components/notification'
import safe from '/utils/safe'

export const follow = safe(async ({ host, onSuccess, id, num }) => {
  try {
    const res = await trackManga({ id, num })
    if (res.error === 'invalid_token') {
      return notifyError(host, `failed to save c${num}`)
    }
    onSuccess(res)
    notify(host, `c${num} marked`)
  } catch(e) {
    notifyError(host, `failed to save c${num}`)
  }
})


export const unfollow = safe(async (host, e) => {
  const { id, name, lastChap: { num } } = e.composedPath()[0].followData
  try {
    const res = await untrackManga({ id, num })
    if (res.error === 'invalid_token') {
      // TODO: retry
      return notifyError(host, `failed to save c${num}`)
    }
    host.myMangas = host.myMangas.filter(m => m.mangaId !== id)
    notify(host, `${name} unfollowed`)
  } catch(e) {
    notifyError(host, `failed to unmark ${name}`)
  }
})

export const fetchMyMangas = safe(apiFetchMyMangas)