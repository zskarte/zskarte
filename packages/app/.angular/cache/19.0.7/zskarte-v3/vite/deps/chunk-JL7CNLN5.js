// ../../node_modules/ol/util.js
function abstract() {
  throw new Error("Unimplemented abstract method.");
}
var uidCounter_ = 0;
function getUid(obj) {
  return obj.ol_uid || (obj.ol_uid = String(++uidCounter_));
}
var VERSION = "10.3.1";

export {
  abstract,
  getUid,
  VERSION
};
//# sourceMappingURL=chunk-JL7CNLN5.js.map
