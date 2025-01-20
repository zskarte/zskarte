// ../../node_modules/ol/resolution.js
function fromResolutionLike(resolution) {
  if (Array.isArray(resolution)) {
    return Math.min(...resolution);
  }
  return resolution;
}

export {
  fromResolutionLike
};
//# sourceMappingURL=chunk-VSE4A5LJ.js.map
