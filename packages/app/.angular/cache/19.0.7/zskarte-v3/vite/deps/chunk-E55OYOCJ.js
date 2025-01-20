import {
  TileImage_default
} from "./chunk-SPH4UQGL.js";
import {
  createFromTileUrlFunctions
} from "./chunk-45BLP2OC.js";
import {
  createFromCapabilitiesMatrixSet
} from "./chunk-PNEWLMU7.js";
import {
  appendParams,
  expandUrl
} from "./chunk-L24RXRRH.js";
import {
  equivalent,
  get3 as get,
  transformExtent
} from "./chunk-QPOUXWMH.js";
import {
  containsExtent
} from "./chunk-IHYRLUFT.js";

// ../../node_modules/ol/source/WMTS.js
var WMTS = class extends TileImage_default {
  /**
   * @param {Options} options WMTS options.
   */
  constructor(options) {
    const requestEncoding = options.requestEncoding !== void 0 ? options.requestEncoding : "KVP";
    const tileGrid = options.tileGrid;
    let urls = options.urls;
    if (urls === void 0 && options.url !== void 0) {
      urls = expandUrl(options.url);
    }
    super({
      attributions: options.attributions,
      attributionsCollapsible: options.attributionsCollapsible,
      cacheSize: options.cacheSize,
      crossOrigin: options.crossOrigin,
      interpolate: options.interpolate,
      projection: options.projection,
      reprojectionErrorThreshold: options.reprojectionErrorThreshold,
      tileClass: options.tileClass,
      tileGrid,
      tileLoadFunction: options.tileLoadFunction,
      tilePixelRatio: options.tilePixelRatio,
      urls,
      wrapX: options.wrapX !== void 0 ? options.wrapX : false,
      transition: options.transition,
      zDirection: options.zDirection
    });
    this.version_ = options.version !== void 0 ? options.version : "1.0.0";
    this.format_ = options.format !== void 0 ? options.format : "image/jpeg";
    this.dimensions_ = options.dimensions !== void 0 ? options.dimensions : {};
    this.layer_ = options.layer;
    this.matrixSet_ = options.matrixSet;
    this.style_ = options.style;
    this.requestEncoding_ = requestEncoding;
    this.setKey(this.getKeyForDimensions_());
    if (urls && urls.length > 0) {
      this.tileUrlFunction = createFromTileUrlFunctions(urls.map(this.createFromWMTSTemplate.bind(this)));
    }
  }
  /**
   * Set the URLs to use for requests.
   * URLs may contain OGC conform URL Template Variables: {TileMatrix}, {TileRow}, {TileCol}.
   * @param {Array<string>} urls URLs.
   * @override
   */
  setUrls(urls) {
    this.urls = urls;
    const key = urls.join("\n");
    this.setTileUrlFunction(createFromTileUrlFunctions(urls.map(this.createFromWMTSTemplate.bind(this))), key);
  }
  /**
   * Get the dimensions, i.e. those passed to the constructor through the
   * "dimensions" option, and possibly updated using the updateDimensions
   * method.
   * @return {!Object} Dimensions.
   * @api
   */
  getDimensions() {
    return this.dimensions_;
  }
  /**
   * Return the image format of the WMTS source.
   * @return {string} Format.
   * @api
   */
  getFormat() {
    return this.format_;
  }
  /**
   * Return the layer of the WMTS source.
   * @return {string} Layer.
   * @api
   */
  getLayer() {
    return this.layer_;
  }
  /**
   * Return the matrix set of the WMTS source.
   * @return {string} MatrixSet.
   * @api
   */
  getMatrixSet() {
    return this.matrixSet_;
  }
  /**
   * Return the request encoding, either "KVP" or "REST".
   * @return {RequestEncoding} Request encoding.
   * @api
   */
  getRequestEncoding() {
    return this.requestEncoding_;
  }
  /**
   * Return the style of the WMTS source.
   * @return {string} Style.
   * @api
   */
  getStyle() {
    return this.style_;
  }
  /**
   * Return the version of the WMTS source.
   * @return {string} Version.
   * @api
   */
  getVersion() {
    return this.version_;
  }
  /**
   * @private
   * @return {string} The key for the current dimensions.
   */
  getKeyForDimensions_() {
    const res = this.urls ? this.urls.slice(0) : [];
    for (const key in this.dimensions_) {
      res.push(key + "-" + this.dimensions_[key]);
    }
    return res.join("/");
  }
  /**
   * Update the dimensions.
   * @param {Object} dimensions Dimensions.
   * @api
   */
  updateDimensions(dimensions) {
    Object.assign(this.dimensions_, dimensions);
    this.setKey(this.getKeyForDimensions_());
  }
  /**
   * @param {string} template Template.
   * @return {import("../Tile.js").UrlFunction} Tile URL function.
   */
  createFromWMTSTemplate(template) {
    const requestEncoding = this.requestEncoding_;
    const context = {
      "layer": this.layer_,
      "style": this.style_,
      "tilematrixset": this.matrixSet_
    };
    if (requestEncoding == "KVP") {
      Object.assign(context, {
        "Service": "WMTS",
        "Request": "GetTile",
        "Version": this.version_,
        "Format": this.format_
      });
    }
    template = requestEncoding == "KVP" ? appendParams(template, context) : template.replace(/\{(\w+?)\}/g, function(m, p) {
      return p.toLowerCase() in context ? context[p.toLowerCase()] : m;
    });
    const tileGrid = (
      /** @type {import("../tilegrid/WMTS.js").default} */
      this.tileGrid
    );
    const dimensions = this.dimensions_;
    return (
      /**
       * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
       * @param {number} pixelRatio Pixel ratio.
       * @param {import("../proj/Projection.js").default} projection Projection.
       * @return {string|undefined} Tile URL.
       */
      function(tileCoord, pixelRatio, projection) {
        if (!tileCoord) {
          return void 0;
        }
        const localContext = {
          "TileMatrix": tileGrid.getMatrixId(tileCoord[0]),
          "TileCol": tileCoord[1],
          "TileRow": tileCoord[2]
        };
        Object.assign(localContext, dimensions);
        let url = template;
        if (requestEncoding == "KVP") {
          url = appendParams(url, localContext);
        } else {
          url = url.replace(/\{(\w+?)\}/g, function(m, p) {
            return encodeURIComponent(localContext[p]);
          });
        }
        return url;
      }
    );
  }
};
var WMTS_default = WMTS;
function optionsFromCapabilities(wmtsCap, config) {
  const layers = wmtsCap["Contents"]["Layer"];
  const l = layers?.find(function(elt) {
    return elt["Identifier"] == config["layer"];
  });
  if (!l) {
    return null;
  }
  const tileMatrixSets = wmtsCap["Contents"]["TileMatrixSet"];
  let idx;
  if (l["TileMatrixSetLink"].length > 1) {
    if ("projection" in config) {
      idx = l["TileMatrixSetLink"].findIndex(function(elt) {
        const tileMatrixSet = tileMatrixSets.find(function(el) {
          return el["Identifier"] == elt["TileMatrixSet"];
        });
        const supportedCRS = tileMatrixSet["SupportedCRS"];
        const proj1 = get(supportedCRS);
        const proj2 = get(config["projection"]);
        if (proj1 && proj2) {
          return equivalent(proj1, proj2);
        }
        return supportedCRS == config["projection"];
      });
    } else {
      idx = l["TileMatrixSetLink"].findIndex(function(elt) {
        return elt["TileMatrixSet"] == config["matrixSet"];
      });
    }
  } else {
    idx = 0;
  }
  if (idx < 0) {
    idx = 0;
  }
  const matrixSet = (
    /** @type {string} */
    l["TileMatrixSetLink"][idx]["TileMatrixSet"]
  );
  const matrixLimits = (
    /** @type {Array<Object>} */
    l["TileMatrixSetLink"][idx]["TileMatrixSetLimits"]
  );
  let format = (
    /** @type {string} */
    l["Format"][0]
  );
  if ("format" in config) {
    format = config["format"];
  }
  idx = l["Style"].findIndex(function(elt) {
    if ("style" in config) {
      return elt["Title"] == config["style"];
    }
    return elt["isDefault"];
  });
  if (idx < 0) {
    idx = 0;
  }
  const style = (
    /** @type {string} */
    l["Style"][idx]["Identifier"]
  );
  const dimensions = {};
  if ("Dimension" in l) {
    l["Dimension"].forEach(function(elt, index, array) {
      const key = elt["Identifier"];
      let value = elt["Default"];
      if (value === void 0) {
        value = elt["Value"][0];
      }
      dimensions[key] = value;
    });
  }
  const matrixSets = wmtsCap["Contents"]["TileMatrixSet"];
  const matrixSetObj = matrixSets.find(function(elt) {
    return elt["Identifier"] == matrixSet;
  });
  let projection;
  const code = matrixSetObj["SupportedCRS"];
  if (code) {
    projection = get(code);
  }
  if ("projection" in config) {
    const projConfig = get(config["projection"]);
    if (projConfig) {
      if (!projection || equivalent(projConfig, projection)) {
        projection = projConfig;
      }
    }
  }
  let wrapX = false;
  const switchXY = projection.getAxisOrientation().startsWith("ne");
  let matrix = matrixSetObj.TileMatrix[0];
  let selectedMatrixLimit = {
    MinTileCol: 0,
    MinTileRow: 0,
    // subtract one to end up at tile top left
    MaxTileCol: matrix.MatrixWidth - 1,
    MaxTileRow: matrix.MatrixHeight - 1
  };
  if (matrixLimits) {
    selectedMatrixLimit = matrixLimits[matrixLimits.length - 1];
    const m = matrixSetObj.TileMatrix.find((tileMatrixValue) => tileMatrixValue.Identifier === selectedMatrixLimit.TileMatrix || matrixSetObj.Identifier + ":" + tileMatrixValue.Identifier === selectedMatrixLimit.TileMatrix);
    if (m) {
      matrix = m;
    }
  }
  const resolution = matrix.ScaleDenominator * 28e-5 / projection.getMetersPerUnit();
  const origin = switchXY ? [matrix.TopLeftCorner[1], matrix.TopLeftCorner[0]] : matrix.TopLeftCorner;
  const tileSpanX = matrix.TileWidth * resolution;
  const tileSpanY = matrix.TileHeight * resolution;
  let matrixSetExtent = matrixSetObj["BoundingBox"];
  if (matrixSetExtent && switchXY) {
    matrixSetExtent = [matrixSetExtent[1], matrixSetExtent[0], matrixSetExtent[3], matrixSetExtent[2]];
  }
  let extent = [
    origin[0] + tileSpanX * selectedMatrixLimit.MinTileCol,
    // add one to get proper bottom/right coordinate
    origin[1] - tileSpanY * (1 + selectedMatrixLimit.MaxTileRow),
    origin[0] + tileSpanX * (1 + selectedMatrixLimit.MaxTileCol),
    origin[1] - tileSpanY * selectedMatrixLimit.MinTileRow
  ];
  if (matrixSetExtent !== void 0 && !containsExtent(matrixSetExtent, extent)) {
    const wgs84BoundingBox = l["WGS84BoundingBox"];
    const wgs84ProjectionExtent = get("EPSG:4326").getExtent();
    extent = matrixSetExtent;
    if (wgs84BoundingBox) {
      wrapX = wgs84BoundingBox[0] === wgs84ProjectionExtent[0] && wgs84BoundingBox[2] === wgs84ProjectionExtent[2];
    } else {
      const wgs84MatrixSetExtent = transformExtent(matrixSetExtent, matrixSetObj["SupportedCRS"], "EPSG:4326");
      wrapX = wgs84MatrixSetExtent[0] - 1e-10 <= wgs84ProjectionExtent[0] && wgs84MatrixSetExtent[2] + 1e-10 >= wgs84ProjectionExtent[2];
    }
  }
  const tileGrid = createFromCapabilitiesMatrixSet(matrixSetObj, extent, matrixLimits);
  const urls = [];
  let requestEncoding = config["requestEncoding"];
  requestEncoding = requestEncoding !== void 0 ? requestEncoding : "";
  if ("OperationsMetadata" in wmtsCap && "GetTile" in wmtsCap["OperationsMetadata"]) {
    const gets = wmtsCap["OperationsMetadata"]["GetTile"]["DCP"]["HTTP"]["Get"];
    for (let i = 0, ii = gets.length; i < ii; ++i) {
      if (gets[i]["Constraint"]) {
        const constraint = gets[i]["Constraint"].find(function(element) {
          return element["name"] == "GetEncoding";
        });
        const encodings = constraint["AllowedValues"]["Value"];
        if (requestEncoding === "") {
          requestEncoding = encodings[0];
        }
        if (requestEncoding === "KVP") {
          if (encodings.includes("KVP")) {
            urls.push(
              /** @type {string} */
              gets[i]["href"]
            );
          }
        } else {
          break;
        }
      } else if (gets[i]["href"]) {
        requestEncoding = "KVP";
        urls.push(
          /** @type {string} */
          gets[i]["href"]
        );
      }
    }
  }
  if (urls.length === 0) {
    requestEncoding = "REST";
    l["ResourceURL"].forEach(function(element) {
      if (element["resourceType"] === "tile") {
        format = element["format"];
        urls.push(
          /** @type {string} */
          element["template"]
        );
      }
    });
  }
  return {
    urls,
    layer: config["layer"],
    matrixSet,
    format,
    projection,
    requestEncoding,
    tileGrid,
    style,
    dimensions,
    wrapX,
    crossOrigin: config["crossOrigin"]
  };
}

export {
  WMTS_default,
  optionsFromCapabilities
};
//# sourceMappingURL=chunk-E55OYOCJ.js.map
