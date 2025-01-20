import {
  DECIMALS,
  getRequestExtent
} from "./chunk-3HIDFUJU.js";
import {
  appendParams
} from "./chunk-L24RXRRH.js";
import {
  decode
} from "./chunk-QVNGVDO5.js";
import {
  get3 as get
} from "./chunk-QPOUXWMH.js";
import {
  getForViewAndSize,
  getHeight,
  getWidth
} from "./chunk-IHYRLUFT.js";
import {
  compareVersions
} from "./chunk-YKLFYZ2P.js";
import {
  floor,
  round
} from "./chunk-3IATBWUD.js";

// ../../node_modules/ol/source/wms.js
var DEFAULT_VERSION = "1.3.0";
var GETFEATUREINFO_IMAGE_SIZE = [101, 101];
function getRequestUrl(baseUrl, extent, size, projection, params) {
  params["WIDTH"] = size[0];
  params["HEIGHT"] = size[1];
  const axisOrientation = projection.getAxisOrientation();
  const v13 = compareVersions(params["VERSION"], "1.3") >= 0;
  params[v13 ? "CRS" : "SRS"] = projection.getCode();
  const bbox = v13 && axisOrientation.startsWith("ne") ? [extent[1], extent[0], extent[3], extent[2]] : extent;
  params["BBOX"] = bbox.join(",");
  return appendParams(baseUrl, params);
}
function getImageSrc(extent, resolution, pixelRatio, projection, url, params, serverType) {
  params = Object.assign({
    REQUEST: "GetMap"
  }, params);
  const imageResolution = resolution / pixelRatio;
  const imageSize = [round(getWidth(extent) / imageResolution, DECIMALS), round(getHeight(extent) / imageResolution, DECIMALS)];
  if (pixelRatio != 1) {
    switch (serverType) {
      case "geoserver":
        const dpi = 90 * pixelRatio + 0.5 | 0;
        if ("FORMAT_OPTIONS" in params) {
          params["FORMAT_OPTIONS"] += ";dpi:" + dpi;
        } else {
          params["FORMAT_OPTIONS"] = "dpi:" + dpi;
        }
        break;
      case "mapserver":
        params["MAP_RESOLUTION"] = 90 * pixelRatio;
        break;
      case "carmentaserver":
      case "qgis":
        params["DPI"] = 90 * pixelRatio;
        break;
      default:
        throw new Error("Unknown `serverType` configured");
    }
  }
  const src = getRequestUrl(url, extent, imageSize, projection, params);
  return src;
}
function getRequestParams(params, request) {
  return Object.assign({
    "REQUEST": request,
    "SERVICE": "WMS",
    "VERSION": DEFAULT_VERSION,
    "FORMAT": "image/png",
    "STYLES": "",
    "TRANSPARENT": true
  }, params);
}
function createLoader(options) {
  const hidpi = options.hidpi === void 0 ? true : options.hidpi;
  const projection = get(options.projection || "EPSG:3857");
  const ratio = options.ratio || 1.5;
  const load = options.load || decode;
  const crossOrigin = options.crossOrigin ?? null;
  return (extent, resolution, pixelRatio) => {
    extent = getRequestExtent(extent, resolution, pixelRatio, ratio);
    if (pixelRatio != 1 && (!hidpi || options.serverType === void 0)) {
      pixelRatio = 1;
    }
    const src = getImageSrc(extent, resolution, pixelRatio, projection, options.url, getRequestParams(options.params, "GetMap"), options.serverType);
    const image = new Image();
    image.crossOrigin = crossOrigin;
    return load(image, src).then((image2) => ({
      image: image2,
      extent,
      pixelRatio
    }));
  };
}
function getFeatureInfoUrl(options, coordinate, resolution) {
  if (options.url === void 0) {
    return void 0;
  }
  const projectionObj = get(options.projection || "EPSG:3857");
  const extent = getForViewAndSize(coordinate, resolution, 0, GETFEATUREINFO_IMAGE_SIZE);
  const baseParams = {
    "QUERY_LAYERS": options.params["LAYERS"],
    "INFO_FORMAT": "application/json"
  };
  Object.assign(baseParams, getRequestParams(options.params, "GetFeatureInfo"), options.params);
  const x = floor((coordinate[0] - extent[0]) / resolution, DECIMALS);
  const y = floor((extent[3] - coordinate[1]) / resolution, DECIMALS);
  const v13 = compareVersions(baseParams["VERSION"], "1.3") >= 0;
  baseParams[v13 ? "I" : "X"] = x;
  baseParams[v13 ? "J" : "Y"] = y;
  return getRequestUrl(options.url, extent, GETFEATUREINFO_IMAGE_SIZE, projectionObj, baseParams);
}
function getLegendUrl(options, resolution) {
  if (options.url === void 0) {
    return void 0;
  }
  const baseParams = {
    "SERVICE": "WMS",
    "VERSION": DEFAULT_VERSION,
    "REQUEST": "GetLegendGraphic",
    "FORMAT": "image/png"
  };
  if (resolution !== void 0) {
    const mpu = get(options.projection || "EPSG:3857").getMetersPerUnit() || 1;
    const pixelSize = 28e-5;
    baseParams["SCALE"] = resolution * mpu / pixelSize;
  }
  Object.assign(baseParams, options.params);
  if (options.params !== void 0 && baseParams["LAYER"] === void 0) {
    const layers = baseParams["LAYERS"];
    const isSingleLayer = !Array.isArray(layers) || layers.length !== 1;
    if (!isSingleLayer) {
      return void 0;
    }
    baseParams["LAYER"] = layers;
  }
  return appendParams(options.url, baseParams);
}

export {
  DEFAULT_VERSION,
  getRequestUrl,
  getImageSrc,
  getRequestParams,
  createLoader,
  getFeatureInfoUrl,
  getLegendUrl
};
//# sourceMappingURL=chunk-RJVK7FH6.js.map
