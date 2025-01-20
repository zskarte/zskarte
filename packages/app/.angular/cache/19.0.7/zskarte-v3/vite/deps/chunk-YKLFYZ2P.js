// ../../node_modules/ol/string.js
function padNumber(number, width, precision) {
  const numberString = precision !== void 0 ? number.toFixed(precision) : "" + number;
  let decimal = numberString.indexOf(".");
  decimal = decimal === -1 ? numberString.length : decimal;
  return decimal > width ? numberString : new Array(1 + width - decimal).join("0") + numberString;
}
function compareVersions(v1, v2) {
  const s1 = ("" + v1).split(".");
  const s2 = ("" + v2).split(".");
  for (let i = 0; i < Math.max(s1.length, s2.length); i++) {
    const n1 = parseInt(s1[i] || "0", 10);
    const n2 = parseInt(s2[i] || "0", 10);
    if (n1 > n2) {
      return 1;
    }
    if (n2 > n1) {
      return -1;
    }
  }
  return 0;
}

export {
  padNumber,
  compareVersions
};
//# sourceMappingURL=chunk-YKLFYZ2P.js.map
