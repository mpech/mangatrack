import { define } from 'hybrids'

export const prop = val => ({
  get: (host, old) => old || val,
  set: (host, v) => v
})
export const defineAll = (...v) => {
  v.flatMap(x => x).forEach(comp => define(comp))
}
