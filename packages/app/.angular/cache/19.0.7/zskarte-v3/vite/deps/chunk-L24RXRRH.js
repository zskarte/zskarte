import {
  hashZXY
} from "./chunk-ABQOD32P.js";
import {
  modulo
} from "./chunk-3IATBWUD.js";

// ../../node_modules/ol/uri.js
function appendParams(uri, params) {
  const keyParams = [];
  Object.keys(params).forEach(function(k) {
    if (params[k] !== null && params[k] !== void 0) {
      keyParams.push(k + "=" + encodeURIComponent(params[k]));
    }
  });
  const qs = keyParams.join("&");
  uri = uri.replace(/[?&]$/, "");
  uri += uri.includes("?") ? "&" : "?";
  return uri + qs;
}
var zRegEx = /\{z\}/g;
var xRegEx = /\{x\}/g;
var yRegEx = /\{y\}/g;
var dashYRegEx = /\{-y\}/g;
function renderXYZTemplate(template, z, x, y, maxY) {
  return template.replace(zRegEx, z.toString()).replace(xRegEx, x.toString()).replace(yRegEx, y.toString()).replace(dashYRegEx, function() {
    if (maxY === void 0) {
      throw new Error("If the URL template has a {-y} placeholder, the grid extent must be known");
    }
    return (maxY - y).toString();
  });
}
function pickUrl(urls, z, x, y) {
  const hash = hashZXY(z, x, y);
  const index = modulo(hash, urls.length);
  return urls[index];
}
function expandUrl(url) {
  const urls = [];
  let match = /\{([a-z])-([a-z])\}/.exec(url);
  if (match) {
    const startCharCode = match[1].charCodeAt(0);
    const stopCharCode = match[2].charCodeAt(0);
    let charCode;
    for (charCode = startCharCode; charCode <= stopCharCode; ++charCode) {
      urls.push(url.replace(match[0], String.fromCharCode(charCode)));
    }
    return urls;
  }
  match = /\{(\d+)-(\d+)\}/.exec(url);
  if (match) {
    const stop = parseInt(match[2], 10);
    for (let i = parseInt(match[1], 10); i <= stop; i++) {
      urls.push(url.replace(match[0], i.toString()));
    }
    return urls;
  }
  urls.push(url);
  return urls;
}

export {
  appendParams,
  renderXYZTemplate,
  pickUrl,
  expandUrl
};
//# sourceMappingURL=chunk-L24RXRRH.js.map
