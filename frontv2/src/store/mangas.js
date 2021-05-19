import { store } from 'hybrids'

const mangas = {}
export default mangas
export const setMangas = (data) => {
  store.set(mangas, data)
}

