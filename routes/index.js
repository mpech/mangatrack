var routers = [
    require('./oauth'),
    require('./mangas'),
    require('./me/mangas'),
]
module.exports = {
    load: function(app){
        routers.forEach(x=>x.load(app));
    }
}