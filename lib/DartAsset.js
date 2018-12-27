"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var path = require('path');

var commandExists = require('command-exists');

var childProcess = require('child_process');

var _require = require('@parcel/utils'),
    promisify = _require.promisify;

var exec = promisify(childProcess.execFile);

var fs = require('@parcel/fs');

var Asset = require('parcel-bundler/lib/Asset');

var tmpDir = require('os').tmpdir();

var md5 = require('parcel-bundler/lib/utils/md5'); // Track installation status so we don't need to check more than once


var dartInstalled = false;

var DartAsset =
/*#__PURE__*/
function (_Asset) {
  _inherits(DartAsset, _Asset);

  function DartAsset(name, options) {
    var _this;

    _classCallCheck(this, DartAsset);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DartAsset).call(this, name, options));
    _this.type = 'js';
    return _this;
  }

  _createClass(DartAsset, [{
    key: "process",
    value: function process() {
      // We don't want to process this asset if the worker is in a warm up phase
      // since the asset will also be processed by the main process, which
      // may cause errors since go also writes files
      if (this.options.isWarmUp) {
        return;
      }

      return _get(_getPrototypeOf(DartAsset.prototype), "process", this).call(this);
    }
  }, {
    key: "generate",
    value: function () {
      var _generate = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var name, err, source, sourceMap, sourceMapPath;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.checkForDart();

              case 2:
                name = md5(this.name).slice(0, 8) + '.js';
                this.jsPath = path.join(tmpDir, name); // Compile

                _context.next = 6;
                return this.dart2js();

              case 6:
                err = _context.sent;

                if (!err) {
                  _context.next = 9;
                  break;
                }

                throw new Error('DART: ' + err);

              case 9:
                _context.next = 11;
                return fs.readFile(this.jsPath, 'utf-8');

              case 11:
                source = _context.sent;
                sourceMapPath = path.join(tmpDir, name + '.map');

                if (!this.options.sourceMaps) {
                  _context.next = 22;
                  break;
                }

                _context.next = 16;
                return fs.readFile(sourceMapPath, 'utf8');

              case 16:
                sourceMap = _context.sent;
                sourceMap = JSON.parse(sourceMap); // remove source map url

                source = source.substring(0, source.lastIndexOf('//# sourceMappingURL'));
                source += '//# sourceMappingURL=/' + name + '.map';
                _context.next = 22;
                return fs.rimraf(sourceMapPath);

              case 22:
                _context.next = 24;
                return fs.rimraf(this.jsPath);

              case 24:
                return _context.abrupt("return", {
                  js: source,
                  "map": sourceMap
                });

              case 25:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function generate() {
        return _generate.apply(this, arguments);
      }

      return generate;
    }()
  }, {
    key: "checkForDart",
    value: function () {
      var _checkForDart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var _ref, _ref2, _, stderr, dartVersion, intVersion;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!dartInstalled) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return");

              case 2:
                _context2.prev = 2;
                _context2.next = 5;
                return commandExists('dart2js');

              case 5:
                _context2.next = 7;
                return commandExists('dart');

              case 7:
                _context2.next = 12;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](2);
                throw new Error("Dart isn't installed. Visit https://dartlang.org/ for more info");

              case 12:
                _context2.next = 14;
                return exec('dart', ['--version']);

              case 14:
                _ref = _context2.sent;
                _ref2 = _slicedToArray(_ref, 2);
                _ = _ref2[0];
                stderr = _ref2[1];
                // weirdly stderr is where the version is sent to instead stdout
                dartVersion = stderr.split(' ')[3].replace('.', '');
                intVersion = parseInt(dartVersion.slice(2)).toPrecision(3);

                if (!(intVersion < 200)) {
                  _context2.next = 22;
                  break;
                }

                throw new Error("The detected dart sdk version is ".concat(dartVersion, " but 2.0.0 or greater is required"));

              case 22:
                dartInstalled = true;

              case 23:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[2, 9]]);
      }));

      function checkForDart() {
        return _checkForDart.apply(this, arguments);
      }

      return checkForDart;
    }()
  }, {
    key: "doCompile",
    value: function () {
      var _doCompile = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Promise(function (res, rej) {
                  childProcess.exec('dart2js ' + ['-o', _this2.jsPath, _this2.name].join(' '), function (err, stdout, stderr) {
                    if (err) {
                      rej(err);
                    } else {
                      res([stdout, stderr]);
                    }
                  });
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function doCompile() {
        return _doCompile.apply(this, arguments);
      }

      return doCompile;
    }()
  }, {
    key: "dart2js",
    value: function () {
      var _dart2js = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4() {
        var _ref3, _ref4, stdout, stderr;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.doCompile();

              case 2:
                _ref3 = _context4.sent;
                _ref4 = _slicedToArray(_ref3, 2);
                stdout = _ref4[0];
                stderr = _ref4[1];

                if (!(stdout == '' && stderr != '')) {
                  _context4.next = 8;
                  break;
                }

                return _context4.abrupt("return", stderr);

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function dart2js() {
        return _dart2js.apply(this, arguments);
      }

      return dart2js;
    }()
  }]);

  return DartAsset;
}(Asset);

module.exports = DartAsset;