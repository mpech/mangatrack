import mangakakalot from './mangakakalot.js'
import fanfox from './fanfox.js'
import manganelo from './manganelo.js'
const importers = [
  mangakakalot,
  fanfox,
  manganelo
]
export function all () { return importers }
export default {
  all
}
