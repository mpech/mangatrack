var routers = [
    require('./mangas'),
]
module.exports = {
    load: function(app){
        routers.forEach(x=>x.load(app));
    }
}