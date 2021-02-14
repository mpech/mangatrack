const errorHandler = require('./errorHandler')

const base = {
  findOneForSure: function (pred, proj) {
    return this.findOne(pred, proj).then(x => {
      if (!x) {
        throw errorHandler.notFound(this.modelName)
      }
      return x
    })
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

module.exports = { setStatic }
