import { apiHost } from '../config'

const headers = () => {
  const token = localStorage.getItem('accessToken')
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer '+token
  }
}

export const get = (url, query = {}) => {
  const queryStr = Object.keys(query).length
    ? '?' + Object.entries(query).filter(([k, v]) => k && v).map(([k, v]) => `${k}=${v}`).join('&')
    : ''

  url = url.startsWith('http') ? url : apiHost + url
  return fetch(url + queryStr, { headers: headers() }).then(res => res.json())
}

const makeBodyVerb = verb => (url, data = {}) => {
  url = url.startsWith('http') ? url : apiHost + url
  return fetch(url, {
    method: verb,
    headers: headers(),
    body: JSON.stringify(data)
  }).then(res => res.json())
}

const put = makeBodyVerb('PUT')
const del = makeBodyVerb('DELETE')
const post = makeBodyVerb('POST')

export const fetchMangas = ({ q, minChapters } = {}) => get('/mangas', { q, minChapters, limit: 18 })
export const fetchMyMangas = () => get('/me/mangas')
export const trackManga = ({ id, num = 1 }) => put('/me/mangas/' + id, { mangaId: id, num })
export const untrackManga = ({ id }) => del('/me/mangas/' + id, { mangaId: id })
export const refreshManga = ({ id, refreshThumb, refreshDescription }) => post('/admin/batches', { id, refreshThumb, refreshDescription })
export const fetchMangaDetail = ({ nameId }) => get('/mangas/' + nameId)