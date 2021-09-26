import asyncHooks from 'async_hooks'
// const fs = require('fs')
// const log = (str) => fs.writeSync(1, `${str}\n`)
const contexts = {}
let enabled = false
const ah = asyncHooks.createHook({
  init: (asyncId, type, triggerAsyncId) => {
    // A new async resource was created
    // If our parent asyncId already had a context object
    // we assign it to our resource asyncId
    if (contexts[triggerAsyncId]) {
      contexts[asyncId] = contexts[triggerAsyncId]
    }
    // log('occuring ' + asyncId+' - '+ triggerAsyncId+' '+JSON.stringify(contexts[asyncId]));
  },
  destroy: (asyncId) => {
    // some cleaning to prevent memory leaks
    delete contexts[asyncId]
  }
})
export const initContext = fn => {
  if (!enabled) {
    console.warn('you have not called ctx.enable, context may not be tracked', enabled)
  }
  // We force the initialization of a new Async Resource
  const asyncResource = new asyncHooks.AsyncResource('REQUEST_CONTEXT')
  return asyncResource.runInAsyncScope(() => {
    // We now have a new asyncId
    const asyncId = asyncHooks.executionAsyncId()
    // We assign a new empty object as the context of our asyncId
    contexts[asyncId] = { id: asyncId }
    return fn(contexts[asyncId])
  })
}
export const get = () => {
  const asyncId = asyncHooks.executionAsyncId()
  // log('getContext :' + asyncId)
  // We try to get the context object linked to our current asyncId
  // if there is none, we return an empty object
  return contexts[asyncId] || {}
}
export const set = (k, v) => {
  const ctx = get()
  ctx[k] = v
}
export const enable = _ => { enabled = true; ah.enable() }
export const disable = _ => { enabled = false; ah.disable() }
export const express = function () {
  enable()
  return function (req, res, next) {
    return initContext(_ => next())
  }
}
export const headers = function () {
  return function (req, res, next) {
    const o = get()
    o['x-forwarded-for'] = req.headers['x-forwarded-for']
    o.pfx = req.headers.pfx
    o.tid = req.headers.tid
    o.sid = req.headers.sid
    o.url = req.protocol + '://' + req.get('host') + req.originalUrl
    return next()
  }
}
export default {
  enable,
  disable,
  initContext,
  get,
  set,
  express,
  headers
}
