//https://github.com/expressjs/express/pull/3610
module.exports = function(fn){
    return function(req,res,next){
        return fn(req, res, next).then(x=>{
            return res.send(x);
        }).catch(next);
    }
}