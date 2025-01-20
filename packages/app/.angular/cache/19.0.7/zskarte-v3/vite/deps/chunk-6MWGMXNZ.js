import {
  Object_default
} from "./chunk-MCYH4ZL5.js";
import {
  get3 as get
} from "./chunk-QPOUXWMH.js";

// ../../node_modules/ol/source/Source.js
var Source = class extends Object_default {
  /**
   * @param {Options} options Source options.
   */
  constructor(options) {
    super();
    this.projection = get(options.projection);
    this.attributions_ = adaptAttributions(options.attributions);
    this.attributionsCollapsible_ = options.attributionsCollapsible ?? true;
    this.loading = false;
    this.state_ = options.state !== void 0 ? options.state : "ready";
    this.wrapX_ = options.wrapX !== void 0 ? options.wrapX : false;
    this.interpolate_ = !!options.interpolate;
    this.viewResolver = null;
    this.viewRejector = null;
    const self = this;
    this.viewPromise_ = new Promise(function(resolve, reject) {
      self.viewResolver = resolve;
      self.viewRejector = reject;
    });
  }
  /**
   * Get the attribution function for the source.
   * @return {?Attribution} Attribution function.
   * @api
   */
  getAttributions() {
    return this.attributions_;
  }
  /**
   * @return {boolean} Attributions are collapsible.
   * @api
   */
  getAttributionsCollapsible() {
    return this.attributionsCollapsible_;
  }
  /**
   * Get the projection of the source.
   * @return {import("../proj/Projection.js").default|null} Projection.
   * @api
   */
  getProjection() {
    return this.projection;
  }
  /**
   * @param {import("../proj/Projection").default} [projection] Projection.
   * @return {Array<number>|null} Resolutions.
   */
  getResolutions(projection) {
    return null;
  }
  /**
   * @return {Promise<import("../View.js").ViewOptions>} A promise for view-related properties.
   */
  getView() {
    return this.viewPromise_;
  }
  /**
   * Get the state of the source, see {@link import("./Source.js").State} for possible states.
   * @return {import("./Source.js").State} State.
   * @api
   */
  getState() {
    return this.state_;
  }
  /**
   * @return {boolean|undefined} Wrap X.
   */
  getWrapX() {
    return this.wrapX_;
  }
  /**
   * @return {boolean} Use linear interpolation when resampling.
   */
  getInterpolate() {
    return this.interpolate_;
  }
  /**
   * Refreshes the source. The source will be cleared, and data from the server will be reloaded.
   * @api
   */
  refresh() {
    this.changed();
  }
  /**
   * Set the attributions of the source.
   * @param {AttributionLike|undefined} attributions Attributions.
   *     Can be passed as `string`, `Array<string>`, {@link module:ol/source/Source~Attribution},
   *     or `undefined`.
   * @api
   */
  setAttributions(attributions) {
    this.attributions_ = adaptAttributions(attributions);
    this.changed();
  }
  /**
   * Set the state of the source.
   * @param {import("./Source.js").State} state State.
   */
  setState(state) {
    this.state_ = state;
    this.changed();
  }
};
function adaptAttributions(attributionLike) {
  if (!attributionLike) {
    return null;
  }
  if (typeof attributionLike === "function") {
    return attributionLike;
  }
  if (!Array.isArray(attributionLike)) {
    attributionLike = [attributionLike];
  }
  return (frameState) => attributionLike;
}
var Source_default = Source;

export {
  Source_default
};
//# sourceMappingURL=chunk-6MWGMXNZ.js.map
