var ctx = require('../lib/ctx');
var querystring = require('querystring');

class Formatter{}
Formatter.prototype.link = function({offset}){
    let url = ctx.get().url;
    let idx = url.indexOf('?');
    let pre = url;
    let query = {offset}
    if(idx != -1){
        pre = url.substring(0, idx);
        let qs = url.substring(idx+1);
        query = querystring.parse(qs);
        query.offset = offset;
    }
    return pre+'?'+querystring.stringify(query);
}

Formatter.prototype.format = function(x){
    let chapters = x.chapters.map(chap=>{
        delete chap._id;
        return chap;
    })

    return Promise.resolve({
        name: x.name,
        chapters
    });
}

Formatter.prototype.paginate = function(o, {count, offset, limit}){
    let links = {}

    if(offset + limit < count){
        links.next = this.link({offset:offset+limit});
    }

    if(offset != 0){
        links.prev = this.link({offset:Math.max(offset-limit, 0)});
    }

    return {count, links, ...o}
}

Formatter.prototype.formatCollection = function(arr, pagination){
    return Promise.all(arr.map(x=>this.format(x))).then(items=>{
        return this.paginate({items}, pagination);
    })
}

module.exports = Formatter;