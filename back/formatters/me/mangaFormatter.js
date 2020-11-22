const format = async function ({ num, _id: mangaId, updatedAt }) {
  return { num, mangaId: mangaId, updatedAt }
}
const formatCollection = async function (map) {
  return {
    items: [...map.entries()].map(([id, { num, updatedAt, state }]) => ({
      mangaId: id,
      num,
      updatedAt,
      state
    }))
  }
}

module.exports = { format, formatCollection }
