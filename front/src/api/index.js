import { apiHost } from '../config'

const headers = () => {
  const token = window.localStorage.getItem('accessToken')
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token
  }
}

const throwOnKo = async res => {
  if (!res.ok) {
    const txt = await res.text()
    let json
    try {
      json = JSON.parse(txt)
    } catch (e) {
      const err = new Error(txt)
      err.error = txt
      throw err
    }
    throw json
  }
  return res.json()
}
export const get = (url, query = {}) => {
  const queryStr = Object.keys(query).length
    ? '?' + Object.entries(query).filter(([k, v]) => k && v).flatMap(([k, v]) => {
        return Array.isArray(v) ? v.map(vx => `${k}=${vx}`) : `${k}=${v}`
      }).join('&')
    : ''
  url = url.startsWith('http') ? url : apiHost + url
  return window.fetch(url + queryStr, { headers: headers() }).then(throwOnKo)
}

const makeBodyVerb = verb => (url, data = {}) => {
  url = url.startsWith('http') ? url : apiHost + url
  return window.fetch(url, {
    method: verb,
    headers: headers(),
    body: JSON.stringify(data)
  }).then(throwOnKo)
}

const put = makeBodyVerb('PUT')
const del = makeBodyVerb('DELETE')
const post = makeBodyVerb('POST')
export const log = (...args) => post('/consolelogs', { data: [...args] })
export const fetchMangas = ({ q, minChapters, tags } = {}) => get('/mangas', { q, minChapters, tags, limit: 18 })
export const fetchMyMangas = ({ populated } = {}) => get('/me/mangas', { populated })
export const trackManga = ({ id, num = 1 }) => put('/me/mangas/' + id, { num })
export const untrackManga = ({ id }) => del('/me/mangas/' + id)
export const refreshManga = ({ id, refreshThumb, refreshDescription }) => post('/admin/batches', { id, refreshThumb, refreshDescription })
export const fetchMangaDetail = ({ nameId }) => get('/mangas/' + nameId)
export const refreshToken = ({ refreshToken }) => {
  const params = new URLSearchParams()
  params.append('grant_type', 'refresh_token')
  params.append('refresh_token', refreshToken)
  const headers = {
    'content-type': 'application/x-www-form-urlencoded'
  }
  return window.fetch(
    apiHost + '/oauth/token',
    { method: 'POST', headers, body: params.toString() }
  ).then(throwOnKo)
}
export const fetchMe = () => get('/me')
export const putTags = ({ word, tags }) => put('/admin/tags', { word, tags })
