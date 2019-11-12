var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config');
var ModelSchema = new Schema({
    name:{type:String, required:true, unique:true},
});

//ModelSchema.plugin(require('@mongoosejs/async-hooks'));

module.exports = mongoose.model('Model', ModelSchema, 'mangas');