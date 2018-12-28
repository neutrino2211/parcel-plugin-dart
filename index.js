// Node 8 supports native async functions - no need to use compiled code! unless plugin is loaded in legacy mode
const isNodePre8 = parseInt(process.versions.node, 10) < 8
const isLegacyMode = process.env["PARCEL-PLUGIN-DART-LEGACY"] == "true"
module.exports = isNodePre8 || isLegacyMode
  ? require('./lib/index')
  : require('./src/index');