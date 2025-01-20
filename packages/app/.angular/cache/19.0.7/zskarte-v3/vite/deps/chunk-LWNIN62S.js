import {
  Layer_default as Layer_default2
} from "./chunk-CB43P2IO.js";
import {
  Layer_default
} from "./chunk-3JTXEXYF.js";
import {
  ImageState_default
} from "./chunk-73LIRBW3.js";
import {
  ViewHint_default
} from "./chunk-PTY4IMKO.js";
import {
  apply,
  compose
} from "./chunk-5DM6XDPZ.js";
import {
  fromUserExtent
} from "./chunk-QPOUXWMH.js";
import {
  containsCoordinate,
  containsExtent,
  getHeight,
  getIntersection,
  getWidth,
  intersects,
  isEmpty
} from "./chunk-IHYRLUFT.js";

// ../../node_modules/ol/layer/BaseImage.js
var BaseImageLayer = class extends Layer_default {
  /**
   * @param {Options<ImageSourceType>} [options] Layer options.
   */
  constructor(options) {
    options = options ? options : {};
    super(options);
  }
};
var BaseImage_default = BaseImageLayer;

// ../../node_modules/ol/renderer/canvas/ImageLayer.js
var CanvasImageLayerRenderer = class extends Layer_default2 {
  /**
   * @param {import("../../layer/Image.js").default} imageLayer Image layer.
   */
  constructor(imageLayer) {
    super(imageLayer);
    this.image = null;
  }
  /**
   * @return {import('../../DataTile.js').ImageLike} Image.
   */
  getImage() {
    return !this.image ? null : this.image.getImage();
  }
  /**
   * Determine whether render should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   * @override
   */
  prepareFrame(frameState) {
    const layerState = frameState.layerStatesArray[frameState.layerIndex];
    const pixelRatio = frameState.pixelRatio;
    const viewState = frameState.viewState;
    const viewResolution = viewState.resolution;
    const imageSource = this.getLayer().getSource();
    const hints = frameState.viewHints;
    let renderedExtent = frameState.extent;
    if (layerState.extent !== void 0) {
      renderedExtent = getIntersection(renderedExtent, fromUserExtent(layerState.extent, viewState.projection));
    }
    if (!hints[ViewHint_default.ANIMATING] && !hints[ViewHint_default.INTERACTING] && !isEmpty(renderedExtent)) {
      if (imageSource) {
        const projection = viewState.projection;
        const image = imageSource.getImage(renderedExtent, viewResolution, pixelRatio, projection);
        if (image) {
          if (this.loadImage(image)) {
            this.image = image;
          } else if (image.getState() === ImageState_default.EMPTY) {
            this.image = null;
          }
        }
      } else {
        this.image = null;
      }
    }
    return !!this.image;
  }
  /**
   * @param {import("../../pixel.js").Pixel} pixel Pixel.
   * @return {Uint8ClampedArray} Data at the pixel location.
   * @override
   */
  getData(pixel) {
    const frameState = this.frameState;
    if (!frameState) {
      return null;
    }
    const layer = this.getLayer();
    const coordinate = apply(frameState.pixelToCoordinateTransform, pixel.slice());
    const layerExtent = layer.getExtent();
    if (layerExtent) {
      if (!containsCoordinate(layerExtent, coordinate)) {
        return null;
      }
    }
    const imageExtent = this.image.getExtent();
    const img = this.image.getImage();
    const imageMapWidth = getWidth(imageExtent);
    const col = Math.floor(img.width * ((coordinate[0] - imageExtent[0]) / imageMapWidth));
    if (col < 0 || col >= img.width) {
      return null;
    }
    const imageMapHeight = getHeight(imageExtent);
    const row = Math.floor(img.height * ((imageExtent[3] - coordinate[1]) / imageMapHeight));
    if (row < 0 || row >= img.height) {
      return null;
    }
    return this.getImageData(img, col, row);
  }
  /**
   * Render the layer.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {HTMLElement} target Target that may be used to render content to.
   * @return {HTMLElement} The rendered element.
   * @override
   */
  renderFrame(frameState, target) {
    const image = this.image;
    const imageExtent = image.getExtent();
    const imageResolution = image.getResolution();
    const [imageResolutionX, imageResolutionY] = Array.isArray(imageResolution) ? imageResolution : [imageResolution, imageResolution];
    const imagePixelRatio = image.getPixelRatio();
    const layerState = frameState.layerStatesArray[frameState.layerIndex];
    const pixelRatio = frameState.pixelRatio;
    const viewState = frameState.viewState;
    const viewCenter = viewState.center;
    const viewResolution = viewState.resolution;
    const scaleX = pixelRatio * imageResolutionX / (viewResolution * imagePixelRatio);
    const scaleY = pixelRatio * imageResolutionY / (viewResolution * imagePixelRatio);
    this.prepareContainer(frameState, target);
    const width = this.context.canvas.width;
    const height = this.context.canvas.height;
    const context = this.getRenderContext(frameState);
    let clipped = false;
    let render = true;
    if (layerState.extent) {
      const layerExtent = fromUserExtent(layerState.extent, viewState.projection);
      render = intersects(layerExtent, frameState.extent);
      clipped = render && !containsExtent(layerExtent, frameState.extent);
      if (clipped) {
        this.clipUnrotated(context, frameState, layerExtent);
      }
    }
    const img = image.getImage();
    const transform = compose(this.tempTransform, width / 2, height / 2, scaleX, scaleY, 0, imagePixelRatio * (imageExtent[0] - viewCenter[0]) / imageResolutionX, imagePixelRatio * (viewCenter[1] - imageExtent[3]) / imageResolutionY);
    this.renderedResolution = imageResolutionY * pixelRatio / imagePixelRatio;
    const dw = img.width * transform[0];
    const dh = img.height * transform[3];
    if (!this.getLayer().getSource().getInterpolate()) {
      context.imageSmoothingEnabled = false;
    }
    this.preRender(context, frameState);
    if (render && dw >= 0.5 && dh >= 0.5) {
      const dx = transform[4];
      const dy = transform[5];
      const opacity = layerState.opacity;
      if (opacity !== 1) {
        context.save();
        context.globalAlpha = opacity;
      }
      context.drawImage(img, 0, 0, +img.width, +img.height, dx, dy, dw, dh);
      if (opacity !== 1) {
        context.restore();
      }
    }
    this.postRender(this.context, frameState);
    if (clipped) {
      context.restore();
    }
    context.imageSmoothingEnabled = true;
    return this.container;
  }
};
var ImageLayer_default = CanvasImageLayerRenderer;

// ../../node_modules/ol/layer/Image.js
var ImageLayer = class extends BaseImage_default {
  /**
   * @param {import("./BaseImage.js").Options<ImageSourceType>} [options] Layer options.
   */
  constructor(options) {
    super(options);
  }
  /**
   * @override
   */
  createRenderer() {
    return new ImageLayer_default(this);
  }
  /**
   * Get data for a pixel location.  A four element RGBA array will be returned.  For requests outside the
   * layer extent, `null` will be returned.  Data for an image can only be retrieved if the
   * source's `crossOrigin` property is set.
   *
   * ```js
   * // display layer data on every pointer move
   * map.on('pointermove', (event) => {
   *   console.log(layer.getData(event.pixel));
   * });
   * ```
   * @param {import("../pixel").Pixel} pixel Pixel.
   * @return {Uint8ClampedArray|Uint8Array|Float32Array|DataView|null} Pixel data.
   * @api
   * @override
   */
  getData(pixel) {
    return super.getData(pixel);
  }
};
var Image_default = ImageLayer;

export {
  ImageLayer_default,
  Image_default
};
//# sourceMappingURL=chunk-LWNIN62S.js.map
