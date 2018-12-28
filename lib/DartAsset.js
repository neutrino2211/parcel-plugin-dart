"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const path = require('path');

const commandExists = require('command-exists');

const childProcess = require('child_process');

const _require = require('@parcel/utils'),
      promisify = _require.promisify;

const exec = promisify(childProcess.execFile);

const fs = require('fs');

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

  generate() {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this._resolved_id = (Math.random() * 1000000).toString(16); // Generate random hex as output id

      var _resolved_name = _this.basename + _this._resolved_id + ".js"; // Check if an output destination already exists and use it
      // because we don't want to bloat the output by writing new files


      fs.readdirSync(_this.options.outDir).forEach(f => {
        if (f.startsWith(_this.basename) && f.endsWith(".js")) {
          _resolved_name = f;
        }
      }); // Confirm the existence of dart2js and dart

      yield _this.checkForDart(); // Compile

      _this.jsPath = path.join(_this.options.outDir, _resolved_name);
      let err = yield _this.dart2js();

      if (err) {
        throw new Error('DART: ' + err);
      } // Proxy script to load dart2js output
      // NB: This is not the best way to handle a dart asset because it bypasses the 'fscache'


      let proxyJS = `
      var _${_this._resolved_id.replace(/\./g, "")}script = document.createElement('script');
      _${_this._resolved_id.replace(/\./g, "")}script.src = "./${_resolved_name}";
      document.head.appendChild(_${_this._resolved_id.replace(/\./g, "")}script);
    `;
      return {
        js: proxyJS
      };
    })();
  }

  checkForDart() {
    return _asyncToGenerator(function* () {
      if (dartInstalled) {
        return;
      } // Check for dart2js


      try {
        yield commandExists('dart2js');
        yield commandExists('dart');
      } catch (e) {
        throw new Error("Dart isn't installed. Visit https://dartlang.org/ for more info");
      } // Ensure dart version >= 2.0.0


      let _ref = yield exec('dart', ['--version']),
          _ref2 = _slicedToArray(_ref, 2),
          _ = _ref2[0],
          stderr = _ref2[1]; // weirdly stderr is where the version is sent to instead stdout


      let dartVersion = stderr.split(' ')[3].replace('.', '');
      let intVersion = parseInt(dartVersion.slice(2)).toPrecision(3);

      if (intVersion < 200) {
        throw new Error(`The detected dart sdk version is ${dartVersion} but 2.0.0 or greater is required`);
      }

      dartInstalled = true;
    })();
  }

  doCompile() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return new Promise((res, rej) => {
        childProcess.exec('dart2js ' + ['-o', _this2.jsPath, _this2.name].join(' '), (err, stdout, stderr) => {
          if (err) {
            rej(err);
          } else {
            res([stdout, stderr]);
          }
        });
      });
    })();
  }

  dart2js() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let _ref3 = yield _this3.doCompile(),
          _ref4 = _slicedToArray(_ref3, 2),
          stdout = _ref4[0],
          stderr = _ref4[1];

      if (stdout == '' && stderr != '') {
        return stderr;
      }
    })();
  }

}

module.exports = DartAsset;