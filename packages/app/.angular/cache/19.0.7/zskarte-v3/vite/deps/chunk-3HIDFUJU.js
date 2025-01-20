import {
  fromResolutionLike
} from "./chunk-VSE4A5LJ.js";
import {
  ERROR_THRESHOLD,
  Triangulation_default,
  calculateSourceResolution,
  render
} from "./chunk-CJZ66Y35.js";
import {
  Source_default
} from "./chunk-6MWGMXNZ.js";
import {
  Image_default
} from "./chunk-QVNGVDO5.js";
import {
  ImageState_default
} from "./chunk-73LIRBW3.js";
import {
  equivalent
} from "./chunk-QPOUXWMH.js";
import {
  containsExtent,
  equals,
  getCenter,
  getForViewAndSize,
  getHeight,
  getIntersection,
  getWidth,
  isEmpty
} from "./chunk-IHYRLUFT.js";
import {
  EventType_default,
  Event_default,
  listen,
  unlistenByKey
} from "./chunk-X7DDFSZC.js";
import {
  ceil
} from "./chunk-3IATBWUD.js";
import {
  linearFindNearest
} from "./chunk-LBIH33AC.js";

// ../../node_modules/ol/source/common.js
var DECIMALS = 4;

// ../../node_modules/ol/reproj/Image.js
var ReprojImage = class extends Image_default {
  /**
   * @param {import("../proj/Projection.js").default} sourceProj Source projection (of the data).
   * @param {import("../proj/Projection.js").default} targetProj Target projection.
   * @param {import("../extent.js").Extent} targetExtent Target extent.
   * @param {number} targetResolution Target resolution.
   * @param {number} pixelRatio Pixel ratio.
   * @param {FunctionType} getImageFunction
   *     Function returning source images (extent, resolution, pixelRatio).
   * @param {boolean} interpolate Use linear interpolation when resampling.
   */
  constructor(sourceProj, targetProj, targetExtent, targetResolution, pixelRatio, getImageFunction, interpolate) {
    let maxSourceExtent = sourceProj.getExtent();
    if (maxSourceExtent && sourceProj.canWrapX()) {
      maxSourceExtent = maxSourceExtent.slice();
      maxSourceExtent[0] = -Infinity;
      maxSourceExtent[2] = Infinity;
    }
    let maxTargetExtent = targetProj.getExtent();
    if (maxTargetExtent && targetProj.canWrapX()) {
      maxTargetExtent = maxTargetExtent.slice();
      maxTargetExtent[0] = -Infinity;
      maxTargetExtent[2] = Infinity;
    }
    const limitedTargetExtent = maxTargetExtent ? getIntersection(targetExtent, maxTargetExtent) : targetExtent;
    const targetCenter = getCenter(limitedTargetExtent);
    const sourceResolution = calculateSourceResolution(sourceProj, targetProj, targetCenter, targetResolution);
    const errorThresholdInPixels = ERROR_THRESHOLD;
    const triangulation = new Triangulation_default(sourceProj, targetProj, limitedTargetExtent, maxSourceExtent, sourceResolution * errorThresholdInPixels, targetResolution);
    const sourceExtent = triangulation.calculateSourceExtent();
    const sourceImage = isEmpty(sourceExtent) ? null : getImageFunction(sourceExtent, sourceResolution, pixelRatio);
    const state = sourceImage ? ImageState_default.IDLE : ImageState_default.EMPTY;
    const sourcePixelRatio = sourceImage ? sourceImage.getPixelRatio() : 1;
    super(targetExtent, targetResolution, sourcePixelRatio, state);
    this.targetProj_ = targetProj;
    this.maxSourceExtent_ = maxSourceExtent;
    this.triangulation_ = triangulation;
    this.targetResolution_ = targetResolution;
    this.targetExtent_ = targetExtent;
    this.sourceImage_ = sourceImage;
    this.sourcePixelRatio_ = sourcePixelRatio;
    this.interpolate_ = interpolate;
    this.canvas_ = null;
    this.sourceListenerKey_ = null;
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    if (this.state == ImageState_default.LOADING) {
      this.unlistenSource_();
    }
    super.disposeInternal();
  }
  /**
   * @return {HTMLCanvasElement} Image.
   * @override
   */
  getImage() {
    return this.canvas_;
  }
  /**
   * @return {import("../proj/Projection.js").default} Projection.
   */
  getProjection() {
    return this.targetProj_;
  }
  /**
   * @private
   */
  reproject_() {
    const sourceState = this.sourceImage_.getState();
    if (sourceState == ImageState_default.LOADED) {
      const width = getWidth(this.targetExtent_) / this.targetResolution_;
      const height = getHeight(this.targetExtent_) / this.targetResolution_;
      this.canvas_ = render(width, height, this.sourcePixelRatio_, fromResolutionLike(this.sourceImage_.getResolution()), this.maxSourceExtent_, this.targetResolution_, this.targetExtent_, this.triangulation_, [{
        extent: this.sourceImage_.getExtent(),
        image: this.sourceImage_.getImage()
      }], 0, void 0, this.interpolate_, true);
    }
    this.state = sourceState;
    this.changed();
  }
  /**
   * Load not yet loaded URI.
   * @override
   */
  load() {
    if (this.state == ImageState_default.IDLE) {
      this.state = ImageState_default.LOADING;
      this.changed();
      const sourceState = this.sourceImage_.getState();
      if (sourceState == ImageState_default.LOADED || sourceState == ImageState_default.ERROR) {
        this.reproject_();
      } else {
        this.sourceListenerKey_ = listen(this.sourceImage_, EventType_default.CHANGE, (e) => {
          const sourceState2 = this.sourceImage_.getState();
          if (sourceState2 == ImageState_default.LOADED || sourceState2 == ImageState_default.ERROR) {
            this.unlistenSource_();
            this.reproject_();
          }
        });
        this.sourceImage_.load();
      }
    }
  }
  /**
   * @private
   */
  unlistenSource_() {
    unlistenByKey(
      /** @type {!import("../events.js").EventsKey} */
      this.sourceListenerKey_
    );
    this.sourceListenerKey_ = null;
  }
};
var Image_default2 = ReprojImage;

// ../../node_modules/ol/source/Image.js
var ImageSourceEventType = {
  /**
   * Triggered when an image starts loading.
   * @event module:ol/source/Image.ImageSourceEvent#imageloadstart
   * @api
   */
  IMAGELOADSTART: "imageloadstart",
  /**
   * Triggered when an image finishes loading.
   * @event module:ol/source/Image.ImageSourceEvent#imageloadend
   * @api
   */
  IMAGELOADEND: "imageloadend",
  /**
   * Triggered if image loading results in an error.
   * @event module:ol/source/Image.ImageSourceEvent#imageloaderror
   * @api
   */
  IMAGELOADERROR: "imageloaderror"
};
var ImageSourceEvent = class extends Event_default {
  /**
   * @param {string} type Type.
   * @param {import("../Image.js").default} image The image.
   */
  constructor(type, image) {
    super(type);
    this.image = image;
  }
};
var ImageSource = class extends Source_default {
  /**
   * @param {Options} options Single image source options.
   */
  constructor(options) {
    super({
      attributions: options.attributions,
      projection: options.projection,
      state: options.state,
      interpolate: options.interpolate !== void 0 ? options.interpolate : true
    });
    this.on;
    this.once;
    this.un;
    this.loader = options.loader || null;
    this.resolutions_ = options.resolutions !== void 0 ? options.resolutions : null;
    this.reprojectedImage_ = null;
    this.reprojectedRevision_ = 0;
    this.image = null;
    this.wantedExtent_;
    this.wantedResolution_;
    this.static_ = options.loader ? options.loader.length === 0 : false;
    this.wantedProjection_ = null;
  }
  /**
   * @return {Array<number>|null} Resolutions.
   * @override
   */
  getResolutions() {
    return this.resolutions_;
  }
  /**
   * @param {Array<number>|null} resolutions Resolutions.
   */
  setResolutions(resolutions) {
    this.resolutions_ = resolutions;
  }
  /**
   * @protected
   * @param {number} resolution Resolution.
   * @return {number} Resolution.
   */
  findNearestResolution(resolution) {
    const resolutions = this.getResolutions();
    if (resolutions) {
      const idx = linearFindNearest(resolutions, resolution, 0);
      resolution = resolutions[idx];
    }
    return resolution;
  }
  /**
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {number} resolution Resolution.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {import("../Image.js").default} Single image.
   */
  getImage(extent, resolution, pixelRatio, projection) {
    const sourceProjection = this.getProjection();
    if (!sourceProjection || !projection || equivalent(sourceProjection, projection)) {
      if (sourceProjection) {
        projection = sourceProjection;
      }
      return this.getImageInternal(extent, resolution, pixelRatio, projection);
    }
    if (this.reprojectedImage_) {
      if (this.reprojectedRevision_ == this.getRevision() && equivalent(this.reprojectedImage_.getProjection(), projection) && this.reprojectedImage_.getResolution() == resolution && equals(this.reprojectedImage_.getExtent(), extent)) {
        return this.reprojectedImage_;
      }
      this.reprojectedImage_.dispose();
      this.reprojectedImage_ = null;
    }
    this.reprojectedImage_ = new Image_default2(sourceProjection, projection, extent, resolution, pixelRatio, (extent2, resolution2, pixelRatio2) => this.getImageInternal(extent2, resolution2, pixelRatio2, sourceProjection), this.getInterpolate());
    this.reprojectedRevision_ = this.getRevision();
    return this.reprojectedImage_;
  }
  /**
   * @abstract
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {number} resolution Resolution.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {import("../Image.js").default} Single image.
   * @protected
   */
  getImageInternal(extent, resolution, pixelRatio, projection) {
    if (this.loader) {
      const requestExtent = getRequestExtent(extent, resolution, pixelRatio, 1);
      const requestResolution = this.findNearestResolution(resolution);
      if (this.image && (this.static_ || this.wantedProjection_ === projection && (this.wantedExtent_ && containsExtent(this.wantedExtent_, requestExtent) || containsExtent(this.image.getExtent(), requestExtent)) && (this.wantedResolution_ && fromResolutionLike(this.wantedResolution_) === requestResolution || fromResolutionLike(this.image.getResolution()) === requestResolution))) {
        return this.image;
      }
      this.wantedProjection_ = projection;
      this.wantedExtent_ = requestExtent;
      this.wantedResolution_ = requestResolution;
      this.image = new Image_default(requestExtent, requestResolution, pixelRatio, this.loader);
      this.image.addEventListener(EventType_default.CHANGE, this.handleImageChange.bind(this));
    }
    return this.image;
  }
  /**
   * Handle image change events.
   * @param {import("../events/Event.js").default} event Event.
   * @protected
   */
  handleImageChange(event) {
    const image = (
      /** @type {import("../Image.js").default} */
      event.target
    );
    let type;
    switch (image.getState()) {
      case ImageState_default.LOADING:
        this.loading = true;
        type = ImageSourceEventType.IMAGELOADSTART;
        break;
      case ImageState_default.LOADED:
        this.loading = false;
        type = ImageSourceEventType.IMAGELOADEND;
        break;
      case ImageState_default.ERROR:
        this.loading = false;
        type = ImageSourceEventType.IMAGELOADERROR;
        break;
      default:
        return;
    }
    if (this.hasListener(type)) {
      this.dispatchEvent(new ImageSourceEvent(type, image));
    }
  }
};
function defaultImageLoadFunction(image, src) {
  image.getImage().src = src;
}
function getRequestExtent(extent, resolution, pixelRatio, ratio) {
  const imageResolution = resolution / pixelRatio;
  const center = getCenter(extent);
  const viewWidth = ceil(getWidth(extent) / imageResolution, DECIMALS);
  const viewHeight = ceil(getHeight(extent) / imageResolution, DECIMALS);
  const marginWidth = ceil((ratio - 1) * viewWidth / 2, DECIMALS);
  const requestWidth = viewWidth + 2 * marginWidth;
  const marginHeight = ceil((ratio - 1) * viewHeight / 2, DECIMALS);
  const requestHeight = viewHeight + 2 * marginHeight;
  return getForViewAndSize(center, imageResolution, 0, [requestWidth, requestHeight]);
}
var Image_default3 = ImageSource;

export {
  DECIMALS,
  defaultImageLoadFunction,
  getRequestExtent,
  Image_default3 as Image_default
};
//# sourceMappingURL=chunk-3HIDFUJU.js.map
