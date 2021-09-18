const safe = (fn, opts = {}) => async (...args) => {
  try {
    return fn(...args).catch(e => {
      console.log({ e })
      return e
    })
  } catch (e) {
    console.log({ e })
    return e
  }
}
export default safe
