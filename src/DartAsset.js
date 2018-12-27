const path = require('path');
const commandExists = require('command-exists');
const childProcess = require('child_process');
const {promisify} = require('@parcel/utils');
const exec = promisify(childProcess.execFile);
const fs = require('@parcel/fs');
const Asset = require('parcel-bundler/lib/Asset');
const tmpDir = require('os').tmpdir();
const md5 = require('parcel-bundler/lib/utils/md5');

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
    // Install confirm the existence of dart2js and dart
    await this.checkForDart();
    const name = md5(this.name).slice(0, 8) + '.js';
    this.jsPath = path.join(tmpDir, name);
    // Compile
    let err = await this.dart2js();
    if (err) {
      throw new Error('DART: ' + err);
    }
    var source = await fs.readFile(this.jsPath, 'utf-8');
    var sourceMap,sourceMapPath=path.join(tmpDir, name + '.map');
    if (this.options.sourceMaps) {
      sourceMap = await fs.readFile(sourceMapPath, 'utf8');

      sourceMap = JSON.parse(sourceMap);
      // remove source map url
      source = source.substring(0, source.lastIndexOf('//# sourceMappingURL'));
      source += '//# sourceMappingURL=/' + name + '.map';
      await fs.rimraf(sourceMapPath)
    }
    await fs.rimraf(this.jsPath)
    return {
      js: source,
      "map": sourceMap
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