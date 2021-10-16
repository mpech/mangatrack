import MangaFormatter from '../mangaFormatter.js'
export const format = async function ({ num, _id: mangaId, updatedAt }) {
  return { num, mangaId: mangaId, updatedAt }
}
export const formatCollection = async function (map, { populated } = {}) {
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

export default {
  format,
  formatCollection
}
