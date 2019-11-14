var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config');
var schema = new Schema({
    nameId:{type:String, required:true, unique:true, index:true},
    name:{type:String, required:true, unique:true},
    chapters:[{
        url:{type:String, required:true},
        num:{type:Number, required:true}
    }],
    updatedAt: {type:Number, default:Date.now, required:true}
});

schema.pre('validate', function(){
    if(!this.nameId){
        this.nameId = this.constructor.canonicalize(this.name||'');
    }
    return Promise.resolve();
})

schema.statics.canonicalize = function(s){
    return s.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9-_]/g,'');
}

schema.statics.findChapter = function(chap){

    return this.findOne({
        nameId: chap.nameId, 
        chapters:{
            $elemMatch:{
                num: chap.num
            }
        }
    })
}
//schema.plugin(require('@mongoosejs/async-hooks'));

module.exports = mongoose.model('Model', schema, 'mangas');