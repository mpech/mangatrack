var bulker = {};
bulker.bulk = function(arr, n, fn, opts={}){
    let p = Promise.resolve();
    opts.onBulkEnd = opts.onBulkEnd || (_=>Promise.resolve());
    let l = arr.length

    //avoid creating an array of n promises...
    //sync at the end
    function rec(offset){
        if(offset >= arr.length){return Promise.resolve()}
        let bulkSize = Math.min(arr.length-offset, n);
        let dfds = Array(bulkSize).fill(0).map((x,i)=>fn(arr[offset+i]));

        return Promise.all(dfds).then(_=>{
            return opts.onBulkEnd( offset + bulkSize >= arr.length-1 ).then(_=>{
                return rec(offset+n);
            })
        });
    }
    return rec(0);
}

bulker.debounce = function(arr, delay, fn){
    return bulker.throttle(arr, 1, delay, fn)
}

bulker.throttle = function(arr, n, delay, fn){
    let base = Date.now();
    let last = 0;
    return bulker.bulk(arr, n, fn, {onBulkEnd:function(finished){
        if(finished){return Promise.resolve(true);}
        let t = Date.now()-base;
        let p;
        if(t-last < delay){
            p = new Promise((ok,ko)=>{
                setTimeout(ok, last + delay - t);
            })
        }else{
            p = Promise.resolve();
        }
        return p.then(_=>{
            last = Date.now()-base;
        });
    }})
}

module.exports = bulker;