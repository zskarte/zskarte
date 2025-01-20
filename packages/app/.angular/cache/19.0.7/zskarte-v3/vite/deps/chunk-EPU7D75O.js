import {
  DEFAULT_VERSION,
  getImageSrc,
  getRequestParams
} from "./chunk-RJVK7FH6.js";
import {
  TileImage_default
} from "./chunk-SPH4UQGL.js";
import {
  appendParams
} from "./chunk-L24RXRRH.js";
import {
  calculateSourceResolution
} from "./chunk-CJZ66Y35.js";
import {
  hash
} from "./chunk-ABQOD32P.js";
import {
  get3 as get,
  transform
} from "./chunk-QPOUXWMH.js";
import {
  buffer,
  createEmpty
} from "./chunk-IHYRLUFT.js";
import {
  compareVersions
} from "./chunk-YKLFYZ2P.js";
import {
  modulo
} from "./chunk-3IATBWUD.js";

// ../../node_modules/ol/source/TileWMS.js
var TileWMS = class extends TileImage_default {
  /**
   * @param {Options} [options] Tile WMS options.
   */
  constructor(options) {
    options = options ? options : (
      /** @type {Options} */
      {}
    );
    const params = Object.assign({}, options.params);
    super({
      attributions: options.attributions,
      attributionsCollapsible: options.attributionsCollapsible,
      cacheSize: options.cacheSize,
      crossOrigin: options.crossOrigin,
      interpolate: options.interpolate,
      projection: options.projection,
      reprojectionErrorThreshold: options.reprojectionErrorThreshold,
      tileClass: options.tileClass,
      tileGrid: options.tileGrid,
      tileLoadFunction: options.tileLoadFunction,
      url: options.url,
      urls: options.urls,
      wrapX: options.wrapX !== void 0 ? options.wrapX : true,
      transition: options.transition,
      zDirection: options.zDirection
    });
    this.gutter_ = options.gutter !== void 0 ? options.gutter : 0;
    this.params_ = params;
    this.v13_ = true;
    this.serverType_ = options.serverType;
    this.hidpi_ = options.hidpi !== void 0 ? options.hidpi : true;
    this.tmpExtent_ = createEmpty();
    this.updateV13_();
    this.setKey(this.getKeyForParams_());
  }
  /**
   * Return the GetFeatureInfo URL for the passed coordinate, resolution, and
   * projection. Return `undefined` if the GetFeatureInfo URL cannot be
   * constructed.
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {number} resolution Resolution.
   * @param {import("../proj.js").ProjectionLike} projection Projection.
   * @param {!Object} params GetFeatureInfo params. `INFO_FORMAT` at least should
   *     be provided. If `QUERY_LAYERS` is not provided then the layers specified
   *     in the `LAYERS` parameter will be used. `VERSION` should not be
   *     specified here.
   * @return {string|undefined} GetFeatureInfo URL.
   * @api
   */
  getFeatureInfoUrl(coordinate, resolution, projection, params) {
    const projectionObj = get(projection);
    const sourceProjectionObj = this.getProjection() || projectionObj;
    let tileGrid = this.getTileGrid();
    if (!tileGrid) {
      tileGrid = this.getTileGridForProjection(sourceProjectionObj);
    }
    const sourceProjCoord = transform(coordinate, projectionObj, sourceProjectionObj);
    const sourceResolution = calculateSourceResolution(sourceProjectionObj, projectionObj, coordinate, resolution);
    const z = tileGrid.getZForResolution(sourceResolution, this.zDirection);
    const tileResolution = tileGrid.getResolution(z);
    const tileCoord = tileGrid.getTileCoordForCoordAndZ(sourceProjCoord, z);
    if (tileGrid.getResolutions().length <= tileCoord[0]) {
      return void 0;
    }
    let tileExtent = tileGrid.getTileCoordExtent(tileCoord, this.tmpExtent_);
    const gutter = this.gutter_;
    if (gutter !== 0) {
      tileExtent = buffer(tileExtent, tileResolution * gutter, tileExtent);
    }
    const baseParams = {
      "QUERY_LAYERS": this.params_["LAYERS"]
    };
    Object.assign(baseParams, getRequestParams(this.params_, "GetFeatureInfo"), params);
    const x = Math.floor((sourceProjCoord[0] - tileExtent[0]) / tileResolution);
    const y = Math.floor((tileExtent[3] - sourceProjCoord[1]) / tileResolution);
    baseParams[this.v13_ ? "I" : "X"] = x;
    baseParams[this.v13_ ? "J" : "Y"] = y;
    return this.getRequestUrl_(tileCoord, tileExtent, 1, sourceProjectionObj || projectionObj, baseParams);
  }
  /**
   * Return the GetLegendGraphic URL, optionally optimized for the passed
   * resolution and possibly including any passed specific parameters. Returns
   * `undefined` if the GetLegendGraphic URL cannot be constructed.
   *
   * @param {number} [resolution] Resolution. If set to undefined, `SCALE`
   *     will not be calculated and included in URL.
   * @param {Object} [params] GetLegendGraphic params. If `LAYER` is set, the
   *     request is generated for this wms layer, else it will try to use the
   *     configured wms layer. Default `FORMAT` is `image/png`.
   *     `VERSION` should not be specified here.
   * @return {string|undefined} GetLegendGraphic URL.
   * @api
   */
  getLegendUrl(resolution, params) {
    if (this.urls[0] === void 0) {
      return void 0;
    }
    const baseParams = {
      "SERVICE": "WMS",
      "VERSION": DEFAULT_VERSION,
      "REQUEST": "GetLegendGraphic",
      "FORMAT": "image/png"
    };
    if (params === void 0 || params["LAYER"] === void 0) {
      const layers = this.params_.LAYERS;
      const isSingleLayer = !Array.isArray(layers) || layers.length === 1;
      if (!isSingleLayer) {
        return void 0;
      }
      baseParams["LAYER"] = layers;
    }
    if (resolution !== void 0) {
      const mpu = this.getProjection() ? this.getProjection().getMetersPerUnit() : 1;
      const pixelSize = 28e-5;
      baseParams["SCALE"] = resolution * mpu / pixelSize;
    }
    Object.assign(baseParams, params);
    return appendParams(
      /** @type {string} */
      this.urls[0],
      baseParams
    );
  }
  /**
   * @return {number} Gutter.
   * @override
   */
  getGutter() {
    return this.gutter_;
  }
  /**
   * Get the user-provided params, i.e. those passed to the constructor through
   * the "params" option, and possibly updated using the updateParams method.
   * @return {Object} Params.
   * @api
   */
  getParams() {
    return this.params_;
  }
  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("../extent.js").Extent} tileExtent Tile extent.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @param {Object} params Params.
   * @return {string|undefined} Request URL.
   * @private
   */
  getRequestUrl_(tileCoord, tileExtent, pixelRatio, projection, params) {
    const urls = this.urls;
    if (!urls) {
      return void 0;
    }
    let url;
    if (urls.length == 1) {
      url = urls[0];
    } else {
      const index = modulo(hash(tileCoord), urls.length);
      url = urls[index];
    }
    return getImageSrc(tileExtent, (this.tileGrid || this.getTileGridForProjection(projection)).getResolution(tileCoord[0]), pixelRatio, projection, url, params, this.serverType_);
  }
  /**
   * Get the tile pixel ratio for this source.
   * @param {number} pixelRatio Pixel ratio.
   * @return {number} Tile pixel ratio.
   * @override
   */
  getTilePixelRatio(pixelRatio) {
    return !this.hidpi_ || this.serverType_ === void 0 ? 1 : pixelRatio;
  }
  /**
   * @private
   * @return {string} The key for the current params.
   */
  getKeyForParams_() {
    let i = 0;
    const res = [];
    for (const key in this.params_) {
      res[i++] = key + "-" + this.params_[key];
    }
    return res.join("/");
  }
  /**
   * Update the user-provided params.
   * @param {Object} params Params.
   * @api
   */
  updateParams(params) {
    Object.assign(this.params_, params);
    this.updateV13_();
    this.setKey(this.getKeyForParams_());
  }
  /**
   * @private
   */
  updateV13_() {
    const version = this.params_["VERSION"] || DEFAULT_VERSION;
    this.v13_ = compareVersions(version, "1.3") >= 0;
  }
  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord The tile coordinate
   * @param {number} pixelRatio The pixel ratio
   * @param {import("../proj/Projection.js").default} projection The projection
   * @return {string|undefined} The tile URL
   * @override
   */
  tileUrlFunction(tileCoord, pixelRatio, projection) {
    let tileGrid = this.getTileGrid();
    if (!tileGrid) {
      tileGrid = this.getTileGridForProjection(projection);
    }
    if (tileGrid.getResolutions().length <= tileCoord[0]) {
      return void 0;
    }
    if (pixelRatio != 1 && (!this.hidpi_ || this.serverType_ === void 0)) {
      pixelRatio = 1;
    }
    const tileResolution = tileGrid.getResolution(tileCoord[0]);
    let tileExtent = tileGrid.getTileCoordExtent(tileCoord, this.tmpExtent_);
    const gutter = this.gutter_;
    if (gutter !== 0) {
      tileExtent = buffer(tileExtent, tileResolution * gutter, tileExtent);
    }
    const baseParams = Object.assign({}, getRequestParams(this.params_, "GetMap"));
    return this.getRequestUrl_(tileCoord, tileExtent, pixelRatio, projection, baseParams);
  }
};
var TileWMS_default = TileWMS;

export {
  TileWMS_default
};
//# sourceMappingURL=chunk-EPU7D75O.js.map
