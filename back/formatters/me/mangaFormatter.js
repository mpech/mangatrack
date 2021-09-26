import MangaFormatter from '../mangaFormatter.js'
const format = async function ({ num, _id: mangaId, updatedAt }) {
  return { num, mangaId: mangaId, updatedAt }
}
const formatCollection = async function (map, { populated } = {}) {
  const formatter = new MangaFormatter()
  return {
    items: await Promise.all([...map.entries()].map(async ([id, { num, updatedAt, state, manga }]) => ({
      mangaId: id,
      num,
      updatedAt,
      state,
      ...(populated ? { manga: await formatter.format(manga) } : {})
    })))
  }
}
export { format }
export { formatCollection }
export default {
  format,
  formatCollection
}
