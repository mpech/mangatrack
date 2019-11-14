var Activity = require('../activity/importerActivity');
var bulker = require('../lib/bulker');
var utils = require('../test/utils');

function run(name, ts){
    let importers = [
        require('../importers/mangakakalot')
    ];

    let activities = importers.map(x=>{
        return new Activity(Reflect.construct(x,[]));
    });

    let res =  bulker.bulk(activities, 10, activity=>{
        return activity.refresh();
    });
    return res;
}

module.exports = {run}
if(!module.parent){
    //TODO cli to filter the importer you want to run
    return utils.runImport(_=>{
        return run();
    });
}