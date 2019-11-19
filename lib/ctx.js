const async_hooks = require('async_hooks');
const fs = require('fs');
const log = (str) => fs.writeSync(1, `${str}\n`);

const contexts = {};
var enabled = false;

let ah = async_hooks.createHook({
  init: (asyncId, type, triggerAsyncId) => {
    // A new async resource was created
    // If our parent asyncId already had a context object
    // we assign it to our resource asyncId
    if (contexts[triggerAsyncId]) {
      contexts[asyncId] = contexts[triggerAsyncId];
    }
    //log('occuring ' + asyncId+' - '+ triggerAsyncId+' '+JSON.stringify(contexts[asyncId]));
  },
  destroy: (asyncId) => {
    // some cleaning to prevent memory leaks
    delete contexts[asyncId];
  },
})


function initContext(fn) {
  if(!enabled){
    console.warn('you have not called ctx.enable, context may not be tracked', enabled);
  }
  // We force the initialization of a new Async Resource
  const asyncResource = new async_hooks.AsyncResource('REQUEST_CONTEXT');
  return asyncResource.runInAsyncScope(() => {
    // We now have a new asyncId
    const asyncId = async_hooks.executionAsyncId();
    // We assign a new empty object as the context of our asyncId
    contexts[asyncId] = {id:asyncId}
    return fn(contexts[asyncId]);
  });
}

function get() {
  const asyncId = async_hooks.executionAsyncId();
  //log('getContext :' + asyncId)
  // We try to get the context object linked to our current asyncId
  // if there is none, we return an empty object
  return contexts[asyncId] || {};
};
function set(k,v){
  let ctx = get();
  ctx[k] = v;
}
module.exports = {
  enable:_=>{enabled = true; ah.enable()},
  disable:_=>{enabled = false; ah.disable()},
  initContext,
  get,
  set,
  express:function(){
    module.exports.enable();
    return function(req,res,next){
      return initContext(_=>next());
    }
  },
  headers:function(){
    return function(req,res,next){
      let o = module.exports.get();
      o['x-forwarded-for'] = req.headers['x-forwarded-for'];
      o['pfx'] = req.headers.pfx;
      o['tid'] = req.headers.tid;
      o['sid'] = req.headers.sid;
      o['url'] = req.protocol + '://' + req.get('host') + req.originalUrl;
      return next();
    }
  }
};