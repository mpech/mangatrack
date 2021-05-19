import axios from 'axios'
import { apiHost } from '../config'

const api = {}
api.fetchMangas = ({ q, minChapters, offset }) => {
  return axios.get(`${apiHost}/mangas`, { limit: 18, q, minChapters })
}
export default api