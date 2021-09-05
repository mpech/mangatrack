const safe = (fn, opts = {}) => async (...args) => {
  try {
    return fn(...args).catch(e => console.log({ e }))
  } catch (e) {
    console.log({ e })
  }
}
export default safe