const fs = require("fs");
const path = require("path");
const yaml_parse = require("yaml").parse;

exports.getPackageLocations = function getPackageLocations(dir){
    var map = {};
    if(!fs.existsSync(path.join(dir,".packages"))) throw new Error("project does not have a .packages file. Did you forget to run 'pub get' ?");
    var code = fs.readFileSync(path.join(dir,".packages")).toString("utf-8")
    var lines = []
    code.split("\n").forEach(function(v){
        if(!v.trim().startsWith("#") && v.trim() != "")lines.push(v.trim());
    })

    lines.forEach((line)=>{
        let kva = line.split(":")
        map[kva[0]] = kva.slice(1).join(":").split("file:///")[1]
    })

    return map;
}

exports.confirmPubspec = function confirmPubspec(dir){
    return fs.readdirSync(dir).indexOf("pubspec.yaml") > -1
}

exports.confirmBuildScript = function confirmBuildScript(dir){
    return fs.readdirSync(dir).indexOf("build.yaml") > -1
}

exports.getPubspec = function getPubspec(dir){
    if(! exports.confirmPubspec(dir)) return {};
    const pubspec = fs.readFileSync(path.join(dir,"pubspec.yaml")).toString("utf-8");
    return yaml_parse(pubspec)
}

exports.getBuildScript = function getBuildScript(dir){
    if(! exports.confirmBuildScript(dir)) return {};
    const build = fs.readFileSync(path.join(dir,"build.yaml")).toString("utf-8");
    return yaml_parse(build)
}

exports.dependencyHasBuildScript = function dependencyHasBuildScript(dep){
    const locations = exports.getPackageLocations(process.cwd())

    if(locations[dep]){
        return exports.confirmBuildScript(locations[dep])
    }
    return false
}