import { apiHost } from '../config'

const get = (url, query) => {
  const queryStr = Object.keys(query).length
    ? '?' + Object.entries(query).filter(([k, v]) => k && v).map(([k, v]) => `${k}=${v}`).join('&')
    : ''
  return fetch(apiHost + url + queryStr).then(res => res.json())
}

export const fetchMangas = ({ q, minChapters, offset } = {}) => get('/mangas', { q, minChapters, offset, limit: 18 })
