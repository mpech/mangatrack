import Base from '../baseFormatter.js'
class Formatter extends Base {
  async format ({ _id, displayName, admin }) {
    return {
      id: _id,
      displayName,
      admin
    }
  }
}
export default Formatter
