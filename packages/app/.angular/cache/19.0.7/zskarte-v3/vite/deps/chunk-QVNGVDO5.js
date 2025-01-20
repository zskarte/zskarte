import {
  ImageState_default
} from "./chunk-73LIRBW3.js";
import {
  CREATE_IMAGE_BITMAP,
  IMAGE_DECODE
} from "./chunk-AIKGHEYG.js";
import {
  EventType_default,
  Target_default,
  listenOnce,
  toPromise,
  unlistenByKey
} from "./chunk-X7DDFSZC.js";

// ../../node_modules/ol/Image.js
var ImageWrapper = class extends Target_default {
  /**
   * @param {import("./extent.js").Extent} extent Extent.
   * @param {number|Array<number>|undefined} resolution Resolution. If provided as array, x and y
   * resolution will be assumed.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("./ImageState.js").default|import("./Image.js").Loader} stateOrLoader State.
   */
  constructor(extent, resolution, pixelRatio, stateOrLoader) {
    super();
    this.extent = extent;
    this.pixelRatio_ = pixelRatio;
    this.resolution = resolution;
    this.state = typeof stateOrLoader === "function" ? ImageState_default.IDLE : stateOrLoader;
    this.image_ = null;
    this.loader = typeof stateOrLoader === "function" ? stateOrLoader : null;
  }
  /**
   * @protected
   */
  changed() {
    this.dispatchEvent(EventType_default.CHANGE);
  }
  /**
   * @return {import("./extent.js").Extent} Extent.
   */
  getExtent() {
    return this.extent;
  }
  /**
   * @return {import('./DataTile.js').ImageLike} Image.
   */
  getImage() {
    return this.image_;
  }
  /**
   * @return {number} PixelRatio.
   */
  getPixelRatio() {
    return this.pixelRatio_;
  }
  /**
   * @return {number|Array<number>} Resolution.
   */
  getResolution() {
    return (
      /** @type {number} */
      this.resolution
    );
  }
  /**
   * @return {import("./ImageState.js").default} State.
   */
  getState() {
    return this.state;
  }
  /**
   * Load not yet loaded URI.
   */
  load() {
    if (this.state == ImageState_default.IDLE) {
      if (this.loader) {
        this.state = ImageState_default.LOADING;
        this.changed();
        const resolution = this.getResolution();
        const requestResolution = Array.isArray(resolution) ? resolution[0] : resolution;
        toPromise(() => this.loader(this.getExtent(), requestResolution, this.getPixelRatio())).then((image) => {
          if ("image" in image) {
            this.image_ = image.image;
          }
          if ("extent" in image) {
            this.extent = image.extent;
          }
          if ("resolution" in image) {
            this.resolution = image.resolution;
          }
          if ("pixelRatio" in image) {
            this.pixelRatio_ = image.pixelRatio;
          }
          if (image instanceof HTMLImageElement || image instanceof ImageBitmap || image instanceof HTMLCanvasElement || image instanceof HTMLVideoElement) {
            this.image_ = image;
          }
          this.state = ImageState_default.LOADED;
        }).catch((error) => {
          this.state = ImageState_default.ERROR;
          console.error(error);
        }).finally(() => this.changed());
      }
    }
  }
  /**
   * @param {import('./DataTile.js').ImageLike} image The image.
   */
  setImage(image) {
    this.image_ = image;
  }
  /**
   * @param {number|Array<number>} resolution Resolution.
   */
  setResolution(resolution) {
    this.resolution = resolution;
  }
};
function listenImage(image, loadHandler, errorHandler) {
  const img = (
    /** @type {HTMLImageElement} */
    image
  );
  let listening = true;
  let decoding = false;
  let loaded = false;
  const listenerKeys = [listenOnce(img, EventType_default.LOAD, function() {
    loaded = true;
    if (!decoding) {
      loadHandler();
    }
  })];
  if (img.src && IMAGE_DECODE) {
    decoding = true;
    img.decode().then(function() {
      if (listening) {
        loadHandler();
      }
    }).catch(function(error) {
      if (listening) {
        if (loaded) {
          loadHandler();
        } else {
          errorHandler();
        }
      }
    });
  } else {
    listenerKeys.push(listenOnce(img, EventType_default.ERROR, errorHandler));
  }
  return function unlisten() {
    listening = false;
    listenerKeys.forEach(unlistenByKey);
  };
}
function load(image, src) {
  return new Promise((resolve, reject) => {
    function handleLoad() {
      unlisten();
      resolve(image);
    }
    function handleError() {
      unlisten();
      reject(new Error("Image load error"));
    }
    function unlisten() {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    }
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (src) {
      image.src = src;
    }
  });
}
function decodeFallback(image, src) {
  if (src) {
    image.src = src;
  }
  return image.src && IMAGE_DECODE ? new Promise((resolve, reject) => image.decode().then(() => resolve(image)).catch((e) => image.complete && image.width ? resolve(image) : reject(e))) : load(image);
}
function decode(image, src) {
  if (src) {
    image.src = src;
  }
  return image.src && IMAGE_DECODE && CREATE_IMAGE_BITMAP ? image.decode().then(() => createImageBitmap(image)).catch((e) => {
    if (image.complete && image.width) {
      return image;
    }
    throw e;
  }) : decodeFallback(image);
}
var Image_default = ImageWrapper;

export {
  listenImage,
  decodeFallback,
  decode,
  Image_default
};
//# sourceMappingURL=chunk-QVNGVDO5.js.map
