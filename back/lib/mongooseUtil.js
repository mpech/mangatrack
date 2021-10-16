import { notFound } from './errorHandler.js'
const base = {
  findOneForSure: function (pred, proj) {
    const modelName = this.modelName
    const p = this.findOne(pred, proj)
    const handler = {
      get (target, prop) {
        if (prop === 'then' && !target._monkeyForSure) {
          target._monkeyForSure = true
          return (resolve, reject) => {
            return target.then(x => {
              return x ? resolve(x) : Promise.resolve().then(() => notFound(modelName)).catch(reject)
            }, reject)
          }
        }
        return target[prop]
      }
    }
    return new Proxy(p, handler)
  }
}
function setStatic (k, schema) {
  if (!base[k]) {
    throw new Error(`unknown method ${k}`)
  }
  if (schema.statics[k] && schema.statics[k] !== base[k]) {
    throw new Error(`${k} already present on schema`)
  }
  schema.statics[k] = base[k]
}
export { setStatic }
export default {
  setStatic
}
