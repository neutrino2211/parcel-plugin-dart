require("@babel/polyfill")
module.exports = function(bundler){
    bundler.addAssetType("dart",require.resolve("./DartAsset"))
}