const bulker = {}
bulker.bulk = function (arr, n, fn, opts = {}) {
  opts.onBulkEnd = opts.onBulkEnd || (_ => Promise.resolve())

  // avoid creating an array of n promises...
  // sync at the end
  function rec (offset) {
    if (offset >= arr.length) { return Promise.resolve() }
    const bulkSize = Math.min(arr.length - offset, n)
    const dfds = Array(bulkSize).fill(0).map((x, i) => fn(arr[offset + i]))

    return Promise.all(dfds).then(_ => {
      return opts.onBulkEnd(offset + bulkSize >= arr.length - 1).then(_ => {
        return rec(offset + n)
      })
    })
  }
  return rec(0)
}

bulker.debounce = function (arr, delay, fn) {
  return bulker.throttle(arr, 1, delay, fn)
}

bulker.throttle = function (arr, n, iDelay, fn) {
  const delay = iDelay + 2 // because round stuff
  let base = Date.now()
  return bulker.bulk(arr, n, fn, {
    onBulkEnd: function (finished) {
      if (finished) { return Promise.resolve(true) }
      const t = Date.now() - base
      let p
      if (t < delay) {
        p = new Promise((resolve, reject) => {
          setTimeout(resolve, delay - t)
        })
      } else {
        p = Promise.resolve()
      }
      return p.then(_ => {
        base = Date.now()
      })
    }
  })
}

bulker.queryStream = async function (cursor, fn) {
  const { default: APH } = await import('../lib/asyncPromiseHandler.js')
  APH.set('stackEnabled', true)
  return new Promise((resolve, reject) => {
    cursor.on('data', async function (doc) {
      APH.tail = fn(doc).catch(e => {
        return reject(e)
      })
    })
    cursor.on('close', async function () {
      APH.all().then(_ => resolve())
    })
    cursor.on('error', reject)
  })
}
export default bulker
