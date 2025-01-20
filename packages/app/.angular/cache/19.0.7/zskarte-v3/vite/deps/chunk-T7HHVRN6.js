import {
  createLoader,
  getFeatureInfoUrl,
  getLegendUrl
} from "./chunk-RJVK7FH6.js";
import {
  Image_default,
  defaultImageLoadFunction
} from "./chunk-3HIDFUJU.js";
import {
  calculateSourceResolution
} from "./chunk-CJZ66Y35.js";
import {
  decode
} from "./chunk-QVNGVDO5.js";
import {
  get3 as get,
  transform
} from "./chunk-QPOUXWMH.js";
import {
  __spreadValues
} from "./chunk-NJ4VOZBH.js";

// ../../node_modules/ol/source/ImageWMS.js
var ImageWMS = class extends Image_default {
  /**
   * @param {Options} [options] ImageWMS options.
   */
  constructor(options) {
    options = options ? options : {};
    super({
      attributions: options.attributions,
      interpolate: options.interpolate,
      projection: options.projection,
      resolutions: options.resolutions
    });
    this.crossOrigin_ = options.crossOrigin !== void 0 ? options.crossOrigin : null;
    this.url_ = options.url;
    this.imageLoadFunction_ = options.imageLoadFunction !== void 0 ? options.imageLoadFunction : defaultImageLoadFunction;
    this.params_ = Object.assign({}, options.params);
    this.serverType_ = options.serverType;
    this.hidpi_ = options.hidpi !== void 0 ? options.hidpi : true;
    this.renderedRevision_ = 0;
    this.ratio_ = options.ratio !== void 0 ? options.ratio : 1.5;
    this.loaderProjection_ = null;
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
    const sourceProjectionObj = this.getProjection();
    if (sourceProjectionObj && sourceProjectionObj !== projectionObj) {
      resolution = calculateSourceResolution(sourceProjectionObj, projectionObj, coordinate, resolution);
      coordinate = transform(coordinate, projectionObj, sourceProjectionObj);
    }
    const options = {
      url: this.url_,
      params: __spreadValues(__spreadValues({}, this.params_), params),
      projection: sourceProjectionObj || projectionObj
    };
    return getFeatureInfoUrl(options, coordinate, resolution);
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
    return getLegendUrl({
      url: this.url_,
      params: __spreadValues(__spreadValues({}, this.params_), params)
    }, resolution);
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
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {number} resolution Resolution.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {import("../Image.js").default} Single image.
   * @override
   */
  getImageInternal(extent, resolution, pixelRatio, projection) {
    if (this.url_ === void 0) {
      return null;
    }
    if (!this.loader || this.loaderProjection_ !== projection) {
      this.loaderProjection_ = projection;
      this.loader = createLoader({
        crossOrigin: this.crossOrigin_,
        params: this.params_,
        projection,
        serverType: this.serverType_,
        hidpi: this.hidpi_,
        url: this.url_,
        ratio: this.ratio_,
        load: (image, src) => {
          this.image.setImage(image);
          this.imageLoadFunction_(this.image, src);
          return decode(image);
        }
      });
    }
    return super.getImageInternal(extent, resolution, pixelRatio, projection);
  }
  /**
   * Return the image load function of the source.
   * @return {import("../Image.js").LoadFunction} The image load function.
   * @api
   */
  getImageLoadFunction() {
    return this.imageLoadFunction_;
  }
  /**
   * Return the URL used for this WMS source.
   * @return {string|undefined} URL.
   * @api
   */
  getUrl() {
    return this.url_;
  }
  /**
   * Set the image load function of the source.
   * @param {import("../Image.js").LoadFunction} imageLoadFunction Image load function.
   * @api
   */
  setImageLoadFunction(imageLoadFunction) {
    this.imageLoadFunction_ = imageLoadFunction;
    this.changed();
  }
  /**
   * Set the URL to use for requests.
   * @param {string|undefined} url URL.
   * @api
   */
  setUrl(url) {
    if (url != this.url_) {
      this.url_ = url;
      this.loader = null;
      this.changed();
    }
  }
  /**
   * Update the user-provided params.
   * @param {Object} params Params.
   * @api
   */
  updateParams(params) {
    Object.assign(this.params_, params);
    this.changed();
  }
  /**
   * @override
   */
  changed() {
    this.image = null;
    super.changed();
  }
};
var ImageWMS_default = ImageWMS;

export {
  ImageWMS_default
};
//# sourceMappingURL=chunk-T7HHVRN6.js.map
