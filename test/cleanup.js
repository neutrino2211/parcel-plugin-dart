const rimraf = require("rimraf");
const path = require("path");
rimraf(path.join(__dirname,"basic","build"),()=>{})
rimraf(path.join(__dirname,"basic","build-node-pre-8"),()=>{})