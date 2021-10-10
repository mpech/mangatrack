import { putTags as putTagsApi } from '@/api'
import { notify, notifyError } from '@/components/notification'
import { safeRetry } from '@/utils/safe'

export const putTags = safeRetry(async ({ host, word, tags, onSuccess, onFailure = () => {} }) => {
  const res = await safeRetry(putTagsApi)({ word, tags })

  if (res.word) {
    notify(host, `${word} updated (${res.tags.join(', ')})`)
    onSuccess(res)
  } else {
    onFailure()
    return notifyError(host, `failed to update ${word} (${tags})`)
  }
})
