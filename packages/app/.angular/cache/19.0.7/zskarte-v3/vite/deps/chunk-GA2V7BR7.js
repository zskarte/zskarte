// ../../node_modules/ol/easing.js
function easeIn(t) {
  return Math.pow(t, 3);
}
function easeOut(t) {
  return 1 - easeIn(1 - t);
}
function inAndOut(t) {
  return 3 * t * t - 2 * t * t * t;
}
function linear(t) {
  return t;
}

export {
  easeIn,
  easeOut,
  inAndOut,
  linear
};
//# sourceMappingURL=chunk-GA2V7BR7.js.map
