import { trackManga, untrackManga, fetchMyMangas as apiFetchMyMangas, refreshManga as apiRefreshManga, fetchMangaDetail } from '@/api'
import { notify, notifyError } from '@/components/notification'
import safe, { safeRetry } from '@/utils/safe'

const safeTrackManga = safeRetry(trackManga)
export const follow = async ({ host, onSuccess, id, num }) => {
  const res = await safeTrackManga({ id, num })
  if (res.error || res instanceof Error) {
    return notifyError(host, `failed to save c${num} (${res.message})`)
  }
  onSuccess(res)
  notify(host, `c${num} marked`)
}

const safeUntrackManga = safeRetry(untrackManga)
export const unfollow = async ({ host, onSuccess, id, num, name }) => {
  const res = await safeUntrackManga({ id, num })
  if (res.error || res instanceof Error) {
    return notifyError(host, `failed to unfollow ${name} (${res.message})`)
  }
  onSuccess(res)
  notify(host, `${name} unfollowed`)
}

export const fetchMyMangas = safeRetry(apiFetchMyMangas)
export const refreshManga = safeRetry(async ({ host, id, refreshThumb, onSuccess, onFailure = () => {} }) => {
  const batch = await safeRetry(apiRefreshManga)({ id, refreshThumb })

  if (batch.status === 'OK') {
    const res = await safe(fetchMangaDetail)({ nameId: host.manga.nameId })
    notify(host, `${host.manga.name} updated`)
    onSuccess(res)
  } else {
    onFailure()
    return notifyError(host, refreshThumb
      ? `failed to update picture for ${host.manga.name}`
      : `failed to update ${host.manga.name} (${batch.reason})`
    )
  }
})
