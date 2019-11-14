var bulker = require('../lib/bulker')
var config = require('../config');
var MangaModel = require('../models/mangaModel');

class ImporterActivity{
    constructor(importer){
        this.imp = importer;
    }
}
ImporterActivity.prototype.refresh = function(){
    //TODO: retry??
    //do not fail all if one fails
    return this.imp.allUpdates().then(dic=>{
        
        let detailStack = [];
        let arr = Object.values(dic);

        return bulker.bulk(arr, 20, chap=>{

            chap.nameId = MangaModel.canonicalize(chap.name);
            return MangaModel.findChapter(chap).then(yes=>{
                if(yes) return true;
                return detailStack.push(chap);
            })
        }).then(_=>detailStack)
    }).then(detailStack=>{
        return bulker.debounce(detailStack, config.manga_detailDebounce, chap=>{

            return this.imp.fetchMangaDetail(chap).then(chapters=>{
                return MangaModel.upsertManga({chapters, ...chap});
            }).catch(e=>{
                config.logger.inf('failed to fetch detail', e);
            })
        })
    })
}
module.exports = ImporterActivity;