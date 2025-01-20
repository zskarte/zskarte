import {
  VOID
} from "./chunk-X7DDFSZC.js";

// ../../node_modules/ol/featureloader.js
var withCredentials = false;
function loadFeaturesXhr(url, format, extent, resolution, projection, success, failure) {
  const xhr2 = new XMLHttpRequest();
  xhr2.open("GET", typeof url === "function" ? url(extent, resolution, projection) : url, true);
  if (format.getType() == "arraybuffer") {
    xhr2.responseType = "arraybuffer";
  }
  xhr2.withCredentials = withCredentials;
  xhr2.onload = function(event) {
    if (!xhr2.status || xhr2.status >= 200 && xhr2.status < 300) {
      const type = format.getType();
      try {
        let source;
        if (type == "text" || type == "json") {
          source = xhr2.responseText;
        } else if (type == "xml") {
          source = xhr2.responseXML || xhr2.responseText;
        } else if (type == "arraybuffer") {
          source = /** @type {ArrayBuffer} */
          xhr2.response;
        }
        if (source) {
          success(
            /** @type {Array<FeatureType>} */
            format.readFeatures(source, {
              extent,
              featureProjection: projection
            }),
            format.readProjection(source)
          );
        } else {
          failure();
        }
      } catch {
        failure();
      }
    } else {
      failure();
    }
  };
  xhr2.onerror = failure;
  xhr2.send();
}
function xhr(url, format) {
  return function(extent, resolution, projection, success, failure) {
    const source = (
      /** @type {import("./source/Vector").default<FeatureType>} */
      this
    );
    loadFeaturesXhr(
      url,
      format,
      extent,
      resolution,
      projection,
      /**
       * @param {Array<FeatureType>} features The loaded features.
       * @param {import("./proj/Projection.js").default} dataProjection Data
       * projection.
       */
      function(features, dataProjection) {
        source.addFeatures(features);
        if (success !== void 0) {
          success(features);
        }
      },
      /* FIXME handle error */
      failure ? failure : VOID
    );
  };
}

export {
  loadFeaturesXhr,
  xhr
};
//# sourceMappingURL=chunk-37JEKLY7.js.map
