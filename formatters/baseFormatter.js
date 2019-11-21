var ctx = require('../lib/ctx')
var querystring = require('querystring')

class Formatter {}
Formatter.prototype.link = function ({ offset }) {
  const url = ctx.get().url
  const idx = url.indexOf('?')
  let pre = url
  let query = { offset }
  if (idx !== -1) {
    pre = url.substring(0, idx)
    const qs = url.substring(idx + 1)
    query = querystring.parse(qs)
    query.offset = offset
  }
  return pre + '?' + querystring.stringify(query)
}

Formatter.prototype.paginate = function (o, { count, offset, limit }) {
  const links = {}

  if (offset + limit < count) {
    links.next = this.link({ offset: offset + limit })
  }

  if (offset !== 0) {
    links.prev = this.link({ offset: Math.max(offset - limit, 0) })
  }

  return { count, links, ...o }
}

Formatter.prototype.formatCollection = async function (arr, pagination) {
  const items = await Promise.all(arr.map(x => this.format(x)))
  return this.paginate({ items }, pagination)
}

module.exports = Formatter
