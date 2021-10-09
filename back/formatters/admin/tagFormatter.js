import Base from '../baseFormatter.js'
class Formatter extends Base {
  async format ({ _id, word, tags }) {
    return {
      word,
      tags,
      type: _id ? 'db' : 'file'
    }
  }
}
export default Formatter
