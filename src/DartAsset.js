const path = require('path');
const commandExists = require('command-exists');
const childProcess = require('child_process');
const {promisify} = require('@parcel/utils');
const exec = promisify(childProcess.execFile);
const fs = require('fs')
const Asset = require('parcel-bundler/lib/Asset'); // Require lib instead of src to support legacy node versions

// Track installation status so we don't need to check more than once
let dartInstalled = false;

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
    var _resolved_name = this.basename+this._resolved_id+".js";

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
    this.jsPath = path.join(this.options.outDir, _resolved_name);
    let err = await this.dart2js();
    if (err) {
      throw new Error('DART: ' + err);
    }

    // Proxy script to load dart2js output
    // NB: This is not the best way to handle a dart asset because it bypasses the 'fscache'
    let proxyJS = `
      var _${this._resolved_id.replace(/\./g,"")}script = document.createElement('script');
      _${this._resolved_id.replace(/\./g,"")}script.src = "./${_resolved_name}";
      document.head.appendChild(_${this._resolved_id.replace(/\./g,"")}script);
    `;
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

  async doCompile() {
    return new Promise((res, rej) => {
      childProcess.exec(
        'dart2js ' + ['-o', this.jsPath, this.name].join(' '),
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

  async dart2js() {
    let [stdout, stderr] = await this.doCompile();
    if (stdout == '' && stderr != '') {
      return stderr;
    }
  }
}

module.exports = DartAsset;