let Base = require('./base');
var moment = require('moment');
var config = require('../config');

class Importer extends Base{
    constructor(){
        super();
        this.allUrl = 'https://mangakakalot.com';
    }
}

Importer.prototype.parseDate = function(s, now){
    now = now||Date.now();
    if(s.includes('ago')){
        s = s.replace('ago','');
        let num = parseInt(s.match(/\d+/));
        if(s.includes('day')){
            return moment(now -num * 3600 * 24 * 1000).valueOf();
        }else if(s.includes('hour')){
            return moment(now -num * 3600 * 1000).valueOf();
        }else{
            return moment(now -num * 60 * 1000).valueOf();
        }
    }
    return (moment(s, 'MM-DD HH:mm')).valueOf()
}

/**
 * fetch all the new updates. Return a payload as
 * {
 *   name:{
 *     last:xx
 *     url:uri
 *   }
 * }
 * @return {[type]} [description]
 */
Importer.prototype.allUpdates = function(){
    return this.domFetch(this.allUrl).then($=>{

        return $('.itemupdate').map((i,x)=>{
            let $x = $(x);
            let title = $x.find('h3 a').text();
            let li = $x.find('li:nth-child(2)').eq(0);
            let url = li.find('a').attr('href');
            let last = li.find('i').text();
            let num = parseFloat(li.find('a').attr('href').match(/_([^_]+)$/)[1])
            let thumbUrl = $x.find('img').attr('src');
            return {title, last, url, num, thumbUrl}
        }).toArray();
    }).then(arr=>{
        return arr.reduce((acc,{title, last, url,num, thumbUrl})=>{
            if(!title || !last || !url){
                config.logger.dbg('failed to parse', title, last, url);
            }
            last = this.parseDate(last);
            if(!acc.hasOwnProperty(title)){
                acc[title] = {last, url, num, name:title, thumbUrl};
            }
            return acc;
        },{})
    })
}

Importer.prototype.parseDateDetail = function(s, now){
    if(!s.includes('ago')){
        return new Date(s).getTime();
    }
    return this.parseDate(s, now)
}
/**
 * url maps to a chapter view. e.g 
 * https://mangakakalot.com/chapter/to_you_the_immortal/chapter_110
 * 
 * return all the chaps for given manga
 * [
 *     {
 *         name:'xx',
 *         num:xx
 *         url
 *     }
 * ]
 * @return {[type]} [description]
 */
Importer.prototype.fetchMangaDetail = function(chap){
    uri = chap.url.split('/');
    uri.pop();//chapter
    let url = uri.join('/').replace('chapter', 'manga');
    config.logger.dbg('fetching', url);
    return this.domFetch(url).then($=>{
        return $('.chapter-list .row').map((i,x)=>{
            let a = $(x).find('a')
            let name = a.attr('title');
            let url = a.attr('href');
            let num = parseFloat(url.match(/_([^_]+)$/)[1]);
            let at = $(x).find('span[title]').eq(0).attr('title');
            at = this.parseDateDetail(at);
            return {name, url, num, at};
        }).toArray();
    })
}
module.exports = Importer;