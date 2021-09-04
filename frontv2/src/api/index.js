import { apiHost } from '../config'

const headers = () => {
  const token = localStorage.getItem('token')
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

const bodyOptions = data => ({
  headers: headers(),
  body: JSON.stringify(data)
})
const put = (url, data = {}) => {
  url = url.startsWith('http') ? url : apiHost + url
  return fetch(url, { method: 'PUT', ...bodyOptions(data) }).then(res => res.json())
}

const del = (url, data = {}) => {
  url = url.startsWith('http') ? url : apiHost + url
  return fetch(url, { method: 'DELETE', ...bodyOptions(data) }).then(res => res.json())
}

export const fetchMangas = ({ q, minChapters } = {}) => get('/mangas', { q, minChapters, limit: 18 })
export const fetchMyMangas = () => get('/me/mangas')
export const trackManga = ({ id, num = 1 }) => put('/me/mangas/' + id, { mangaId: id })
export const untrackManga = ({ id, num = 1 }) => del('/me/mangas/' + id, { mangaId: id })
