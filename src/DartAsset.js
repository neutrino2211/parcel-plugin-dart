const path = require('path');
const commandExists = require('command-exists');
const childProcess = require('child_process');
const {promisify} = require('@parcel/utils');
const exec = promisify(childProcess.execFile);
const fs = require('fs')
const Asset = require('parcel-bundler/lib/Asset'); // Require lib instead of src to support legacy node versions
const compiler = require("./compiler");

// Track installation status so we don't need to check more than once
let dartInstalled = false;

function mkdir(dir){
  if(fs.existsSync(dir)) return;
  return fs.mkdirSync(dir)
}

class DartAsset extends Asset {
  constructor(name, options) {
    super(name, options);
    this.type = 'js';
  }

  process() {
    // We don't want to process this asset if the worker is in a warm up phase
    // since the asset will also be processed by the main process, which
    // may cause errors since go also writes files
    if (this.options.isWarmUp) {
      return;
    }

    return super.process();
  }

  async generate() {
    this._resolved_id = (Math.random()*1000000).toString(16) // Generate random hex as output id

    // Check if an output destination already exists and use it
    // because we don't want to bloat the output by writing new files
    fs.readdirSync(this.options.outDir).forEach((f)=>{
      if(f.startsWith(this.basename) && f.endsWith(".js")){
        _resolved_name = f;
      }
    })

    // Confirm the existence of dart2js and dart
    await this.checkForDart();

    // Compile
    let err = await compiler.compile();
    if (err) {
      throw new Error('DART: ' + err);
    }
    const build = await compiler.getRelevantFiles(process.cwd(), this.basename);
    await compiler.clearBuildPath();
    // Proxy script to load build_runner output
    // NB: This is not the best way to handle a dart asset because it bypasses the 'fscache'
    let proxyJS = `
      var _${this._resolved_id.replace(/\./g,"")}script = document.createElement('script');
      _${this._resolved_id.replace(/\./g,"")}script.src = "./${build.project[0]}";
      document.head.appendChild(_${this._resolved_id.replace(/\./g,"")}script);
    `;

    // Create package paths
    mkdir(path.join(this.options.outDir,"packages"))
    Object.getOwnPropertyNames(compiler.resolver.getPubspec(process.cwd())["dependencies"] || {}).forEach((dep)=>{
      mkdir(path.join(this.options.outDir,"packages",dep))
    })
    build.project.forEach((file)=>{
      fs.copyFileSync(path.join(compiler.buildPath,file), path.join(this.options.outDir,file))
    })
    build.dependencies.forEach((file)=>{
      fs.copyFileSync(path.join(compiler.buildPath,file), path.join(this.options.outDir,file))
    })

    return {
      js: proxyJS
    };
  }


  async checkForDart() {
    if (dartInstalled) {
      return;
    }

    // Check for dart2js
    try {
      await commandExists('dart2js');
      await commandExists('dart');
    } catch (e) {
      throw new Error(
        "Dart isn't installed. Visit https://dartlang.org/ for more info"
      );
    }

    // Ensure dart version >= 2.0.0
    let [_, stderr] = await exec('dart', ['--version']); // weirdly stderr is where the version is sent to instead stdout
    let dartVersion = stderr.split(' ')[3].replace('.', '');
    let intVersion = parseInt(dartVersion.slice(2)).toPrecision(3);
    if (intVersion < 200) {
      throw new Error(
        `The detected dart sdk version is ${dartVersion} but 2.0.0 or greater is required`
      );
    }

    dartInstalled = true;
  }
}

module.exports = DartAsset;