export default (function (fn) {
  return function (req, res, next) {
    return fn(req, res, next).then(x => {
      return res.send(x)
    }).catch(next)
  }
})
