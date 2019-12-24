function Singleton (open, close, label) {
  let opened = false
  let closed = false
  let data = null
  return {
    open: function () {
      if (opened) {
        return Promise.resolve()
      }
      opened = true
      return open(...arguments).then(d => {
        data = d
        return d
      })
    },
    close: function () {
      if (closed) {
        return Promise.resolve()
      }
      closed = true
      return close(data)
    }
  }
};
module.exports = Singleton
