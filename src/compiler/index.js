const {exec} = require("child_process");
const {join, dirname} = require("path");
const {tmpdir} = require("os");
const fs = require("fs");
const rimraf = require("rimraf");
const resolver = require("./resolver");

exports.resolver = resolver

exports.buildPath = join(
    tmpdir(),
    generateBuildName()
)

exports.project = "web";
let project = exports.project;

Object.defineProperty(exports,"project",{
    get(){
        return exports.project;
    },

    set(v){
        project = v;
    }
})

const buildPath = exports.buildPath;

async function doCompile(outputPath) {
    return new Promise((res, rej) => {
        exec(
            'pub run build_runner build --release -o '+project+':' + outputPath,
            (err, stdout, stderr) => {
                if (err) {
                    rej(err);
                } else {
                    res([stdout, stderr]);
                }
            }
        );
    });
}

function generateBuildName(){
    return "build-"+ (Math.random()*100000).toString(16)+"output"
}

exports.compile = async function compile() {
    let [stdout, stderr] = await doCompile(buildPath);
    if (stdout == '' && stderr != '') {
        return stderr;
    }
}

exports.clearBuildPath = async function clearBuildPath(){
    rimraf(buildPath,()=>{});
}

exports.getRelevantFiles = async function getRelevantFiles(dir, name){
    var projectFiles = []
    var dependencyFiles = []
    const dependencies = resolver.getPubspec(dir).dependencies
    const locations = resolver.getPackageLocations(dir)
    if(dependencies==undefined)return [];

    Object.getOwnPropertyNames(dependencies).forEach((dep)=>{
        var packageLocation = locations[dep]
        if(packageLocation == undefined){
            throw new Error(`Can't find package '${dep}'`)
        }
        fs.readdirSync(packageLocation).forEach((v)=>{
            if(v.endsWith(".js")) dependencyFiles.push(join("packages",dep,v));
        })
        if(resolver.confirmBuildScript(dirname(packageLocation))){
            var jsBuildFiles = resolver.getBuildScript(dirname(packageLocation)).builders[dep].build_extensions
            projectFiles.push(name.split(".dart")[0]+jsBuildFiles[".dart"]+".js")
        } else {
            projectFiles.push(name+".js")
        }
    })
    return {
        project: projectFiles,
        dependencies: dependencyFiles
    }
}