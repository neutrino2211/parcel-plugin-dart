"use strict";

module.exports = function (bundler) {
  bundler.addAssetType("dart", require.resolve("./DartAsset"));
};