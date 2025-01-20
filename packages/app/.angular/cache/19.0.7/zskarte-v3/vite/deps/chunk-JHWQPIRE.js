import {
  get
} from "./chunk-JNDXFVRB.js";
import {
  asArray
} from "./chunk-QABMMYJI.js";
import {
  ImageState_default
} from "./chunk-73LIRBW3.js";
import {
  getUid
} from "./chunk-JL7CNLN5.js";

// ../../node_modules/ol/style/Fill.js
var Fill = class _Fill {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options || {};
    this.patternImage_ = null;
    this.color_ = null;
    if (options.color !== void 0) {
      this.setColor(options.color);
    }
  }
  /**
   * Clones the style. The color is not cloned if it is a {@link module:ol/colorlike~ColorLike}.
   * @return {Fill} The cloned style.
   * @api
   */
  clone() {
    const color = this.getColor();
    return new _Fill({
      color: Array.isArray(color) ? color.slice() : color || void 0
    });
  }
  /**
   * Get the fill color.
   * @return {import("../color.js").Color|import("../colorlike.js").ColorLike|import('../colorlike.js').PatternDescriptor|null} Color.
   * @api
   */
  getColor() {
    return this.color_;
  }
  /**
   * Set the color.
   *
   * @param {import("../color.js").Color|import("../colorlike.js").ColorLike|import('../colorlike.js').PatternDescriptor|null} color Color.
   * @api
   */
  setColor(color) {
    if (color !== null && typeof color === "object" && "src" in color) {
      const patternImage = get(null, color.src, "anonymous", void 0, color.offset ? null : color.color ? color.color : null, !(color.offset && color.size));
      patternImage.ready().then(() => {
        this.patternImage_ = null;
      });
      if (patternImage.getImageState() === ImageState_default.IDLE) {
        patternImage.load();
      }
      if (patternImage.getImageState() === ImageState_default.LOADING) {
        this.patternImage_ = patternImage;
      }
    }
    this.color_ = color;
  }
  /**
   * @return {string} Key of the fill for cache lookup.
   */
  getKey() {
    const fill = this.getColor();
    if (!fill) {
      return "";
    }
    return fill instanceof CanvasPattern || fill instanceof CanvasGradient ? getUid(fill) : typeof fill === "object" && "src" in fill ? fill.src + ":" + fill.offset : asArray(fill).toString();
  }
  /**
   * @return {boolean} The fill style is loading an image pattern.
   */
  loading() {
    return !!this.patternImage_;
  }
  /**
   * @return {Promise<void>} `false` or a promise that resolves when the style is ready to use.
   */
  ready() {
    return this.patternImage_ ? this.patternImage_.ready() : Promise.resolve();
  }
};
var Fill_default = Fill;

export {
  Fill_default
};
//# sourceMappingURL=chunk-JHWQPIRE.js.map
