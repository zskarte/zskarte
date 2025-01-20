import {
  Layer_default
} from "./chunk-PGKZJFAO.js";
import {
  EventType_default,
  Event_default
} from "./chunk-3JTXEXYF.js";
import {
  asArray
} from "./chunk-QABMMYJI.js";
import {
  createCanvasContext2D,
  getSharedCanvasContext2D
} from "./chunk-73LIRBW3.js";
import {
  apply,
  compose,
  create,
  makeInverse,
  toString
} from "./chunk-5DM6XDPZ.js";
import {
  getBottomLeft,
  getBottomRight,
  getHeight,
  getTopLeft,
  getTopRight,
  getWidth
} from "./chunk-IHYRLUFT.js";
import {
  equals
} from "./chunk-LBIH33AC.js";

// ../../node_modules/ol/render/canvas/ZIndexContext.js
var ZIndexContext = class {
  constructor() {
    this.instructions_ = [];
    this.zIndex = 0;
    this.offset_ = 0;
    this.context_ = /** @type {ZIndexContextProxy} */
    new Proxy(getSharedCanvasContext2D(), {
      get: (target, property) => {
        if (typeof /** @type {*} */
        getSharedCanvasContext2D()[property] !== "function") {
          return void 0;
        }
        if (!this.instructions_[this.zIndex + this.offset_]) {
          this.instructions_[this.zIndex + this.offset_] = [];
        }
        this.instructions_[this.zIndex + this.offset_].push(property);
        return this.pushMethodArgs_;
      },
      set: (target, property, value) => {
        if (!this.instructions_[this.zIndex + this.offset_]) {
          this.instructions_[this.zIndex + this.offset_] = [];
        }
        this.instructions_[this.zIndex + this.offset_].push(property, value);
        return true;
      }
    });
  }
  /**
   * @private
   * @param {...*} args Args.
   * @return {ZIndexContext} This.
   */
  pushMethodArgs_ = (...args) => {
    this.instructions_[this.zIndex + this.offset_].push(args);
    return this;
  };
  /**
   * Push a function that renders to the context directly.
   * @param {function(CanvasRenderingContext2D): void} render Function.
   */
  pushFunction(render) {
    this.instructions_[this.zIndex + this.offset_].push(render);
  }
  /**
   * Get a proxy for CanvasRenderingContext2D which does not support getting state
   * (e.g. `context.globalAlpha`, which will return `undefined`). To set state, if it relies on a
   * previous state (e.g. `context.globalAlpha = context.globalAlpha / 2`), set a function,
   * e.g. `context.globalAlpha = (context) => context.globalAlpha / 2`.
   * @return {ZIndexContextProxy} Context.
   */
  getContext() {
    return this.context_;
  }
  /**
   * @param {CanvasRenderingContext2D} context Context.
   */
  draw(context) {
    this.instructions_.forEach((instructionsAtIndex) => {
      for (let i = 0, ii = instructionsAtIndex.length; i < ii; ++i) {
        const property = instructionsAtIndex[i];
        if (typeof property === "function") {
          property(context);
          continue;
        }
        const instructionAtIndex = instructionsAtIndex[++i];
        if (typeof /** @type {*} */
        context[property] === "function") {
          context[property](...instructionAtIndex);
        } else {
          if (typeof instructionAtIndex === "function") {
            context[property] = instructionAtIndex(context);
            continue;
          }
          context[property] = instructionAtIndex;
        }
      }
    });
  }
  clear() {
    this.instructions_.length = 0;
    this.zIndex = 0;
    this.offset_ = 0;
  }
  /**
   * Offsets the zIndex by the highest current zIndex. Useful for rendering multiple worlds or tiles, to
   * avoid conflicting context.clip() or context.save()/restore() calls.
   */
  offset() {
    this.offset_ = this.instructions_.length;
    this.zIndex = 0;
  }
};
var ZIndexContext_default = ZIndexContext;

// ../../node_modules/ol/renderer/canvas/Layer.js
var canvasPool = [];
var pixelContext = null;
function createPixelContext() {
  pixelContext = createCanvasContext2D(1, 1, void 0, {
    willReadFrequently: true
  });
}
var CanvasLayerRenderer = class extends Layer_default {
  /**
   * @param {LayerType} layer Layer.
   */
  constructor(layer) {
    super(layer);
    this.container = null;
    this.renderedResolution;
    this.tempTransform = create();
    this.pixelTransform = create();
    this.inversePixelTransform = create();
    this.context = null;
    this.deferredContext_ = null;
    this.containerReused = false;
    this.frameState = null;
  }
  /**
   * @param {import('../../DataTile.js').ImageLike} image Image.
   * @param {number} col The column index.
   * @param {number} row The row index.
   * @return {Uint8ClampedArray|null} The image data.
   */
  getImageData(image, col, row) {
    if (!pixelContext) {
      createPixelContext();
    }
    pixelContext.clearRect(0, 0, 1, 1);
    let data;
    try {
      pixelContext.drawImage(image, col, row, 1, 1, 0, 0, 1, 1);
      data = pixelContext.getImageData(0, 0, 1, 1).data;
    } catch (err) {
      pixelContext = null;
      return null;
    }
    return data;
  }
  /**
   * @param {import('../../Map.js').FrameState} frameState Frame state.
   * @return {string} Background color.
   */
  getBackground(frameState) {
    const layer = this.getLayer();
    let background = layer.getBackground();
    if (typeof background === "function") {
      background = background(frameState.viewState.resolution);
    }
    return background || void 0;
  }
  /**
   * Get a rendering container from an existing target, if compatible.
   * @param {HTMLElement} target Potential render target.
   * @param {string} transform CSS Transform.
   * @param {string} [backgroundColor] Background color.
   */
  useContainer(target, transform, backgroundColor) {
    const layerClassName = this.getLayer().getClassName();
    let container, context;
    if (target && target.className === layerClassName && (!backgroundColor || target && target.style.backgroundColor && equals(asArray(target.style.backgroundColor), asArray(backgroundColor)))) {
      const canvas = target.firstElementChild;
      if (canvas instanceof HTMLCanvasElement) {
        context = canvas.getContext("2d");
      }
    }
    if (context && context.canvas.style.transform === transform) {
      this.container = target;
      this.context = context;
      this.containerReused = true;
    } else if (this.containerReused) {
      this.container = null;
      this.context = null;
      this.containerReused = false;
    } else if (this.container) {
      this.container.style.backgroundColor = null;
    }
    if (!this.container) {
      container = document.createElement("div");
      container.className = layerClassName;
      let style = container.style;
      style.position = "absolute";
      style.width = "100%";
      style.height = "100%";
      context = createCanvasContext2D();
      const canvas = context.canvas;
      container.appendChild(canvas);
      style = canvas.style;
      style.position = "absolute";
      style.left = "0";
      style.transformOrigin = "top left";
      this.container = container;
      this.context = context;
    }
    if (!this.containerReused && backgroundColor && !this.container.style.backgroundColor) {
      this.container.style.backgroundColor = backgroundColor;
    }
  }
  /**
   * @param {CanvasRenderingContext2D} context Context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {import("../../extent.js").Extent} extent Clip extent.
   * @protected
   */
  clipUnrotated(context, frameState, extent) {
    const topLeft = getTopLeft(extent);
    const topRight = getTopRight(extent);
    const bottomRight = getBottomRight(extent);
    const bottomLeft = getBottomLeft(extent);
    apply(frameState.coordinateToPixelTransform, topLeft);
    apply(frameState.coordinateToPixelTransform, topRight);
    apply(frameState.coordinateToPixelTransform, bottomRight);
    apply(frameState.coordinateToPixelTransform, bottomLeft);
    const inverted = this.inversePixelTransform;
    apply(inverted, topLeft);
    apply(inverted, topRight);
    apply(inverted, bottomRight);
    apply(inverted, bottomLeft);
    context.save();
    context.beginPath();
    context.moveTo(Math.round(topLeft[0]), Math.round(topLeft[1]));
    context.lineTo(Math.round(topRight[0]), Math.round(topRight[1]));
    context.lineTo(Math.round(bottomRight[0]), Math.round(bottomRight[1]));
    context.lineTo(Math.round(bottomLeft[0]), Math.round(bottomLeft[1]));
    context.clip();
  }
  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {HTMLElement} target Target that may be used to render content to.
   * @protected
   */
  prepareContainer(frameState, target) {
    const extent = frameState.extent;
    const resolution = frameState.viewState.resolution;
    const rotation = frameState.viewState.rotation;
    const pixelRatio = frameState.pixelRatio;
    const width = Math.round(getWidth(extent) / resolution * pixelRatio);
    const height = Math.round(getHeight(extent) / resolution * pixelRatio);
    compose(this.pixelTransform, frameState.size[0] / 2, frameState.size[1] / 2, 1 / pixelRatio, 1 / pixelRatio, rotation, -width / 2, -height / 2);
    makeInverse(this.inversePixelTransform, this.pixelTransform);
    const canvasTransform = toString(this.pixelTransform);
    this.useContainer(target, canvasTransform, this.getBackground(frameState));
    if (!this.containerReused) {
      const canvas = this.context.canvas;
      if (canvas.width != width || canvas.height != height) {
        canvas.width = width;
        canvas.height = height;
      } else {
        this.context.clearRect(0, 0, width, height);
      }
      if (canvasTransform !== canvas.style.transform) {
        canvas.style.transform = canvasTransform;
      }
    }
  }
  /**
   * @param {import("../../render/EventType.js").default} type Event type.
   * @param {CanvasRenderingContext2D} context Context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @private
   */
  dispatchRenderEvent_(type, context, frameState) {
    const layer = this.getLayer();
    if (layer.hasListener(type)) {
      const event = new Event_default(type, this.inversePixelTransform, frameState, context);
      layer.dispatchEvent(event);
    }
  }
  /**
   * @param {CanvasRenderingContext2D} context Context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @protected
   */
  preRender(context, frameState) {
    this.frameState = frameState;
    if (frameState.declutter) {
      return;
    }
    this.dispatchRenderEvent_(EventType_default.PRERENDER, context, frameState);
  }
  /**
   * @param {CanvasRenderingContext2D} context Context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @protected
   */
  postRender(context, frameState) {
    if (frameState.declutter) {
      return;
    }
    this.dispatchRenderEvent_(EventType_default.POSTRENDER, context, frameState);
  }
  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   */
  renderDeferredInternal(frameState) {
  }
  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {import('../../render/canvas/ZIndexContext.js').ZIndexContextProxy} Context.
   */
  getRenderContext(frameState) {
    if (frameState.declutter && !this.deferredContext_) {
      this.deferredContext_ = new ZIndexContext_default();
    }
    return frameState.declutter ? this.deferredContext_.getContext() : this.context;
  }
  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @override
   */
  renderDeferred(frameState) {
    if (!frameState.declutter) {
      return;
    }
    this.dispatchRenderEvent_(EventType_default.PRERENDER, this.context, frameState);
    if (frameState.declutter && this.deferredContext_) {
      this.deferredContext_.draw(this.context);
      this.deferredContext_.clear();
    }
    this.renderDeferredInternal(frameState);
    this.dispatchRenderEvent_(EventType_default.POSTRENDER, this.context, frameState);
  }
  /**
   * Creates a transform for rendering to an element that will be rotated after rendering.
   * @param {import("../../coordinate.js").Coordinate} center Center.
   * @param {number} resolution Resolution.
   * @param {number} rotation Rotation.
   * @param {number} pixelRatio Pixel ratio.
   * @param {number} width Width of the rendered element (in pixels).
   * @param {number} height Height of the rendered element (in pixels).
   * @param {number} offsetX Offset on the x-axis in view coordinates.
   * @protected
   * @return {!import("../../transform.js").Transform} Transform.
   */
  getRenderTransform(center, resolution, rotation, pixelRatio, width, height, offsetX) {
    const dx1 = width / 2;
    const dy1 = height / 2;
    const sx = pixelRatio / resolution;
    const sy = -sx;
    const dx2 = -center[0] + offsetX;
    const dy2 = -center[1];
    return compose(this.tempTransform, dx1, dy1, sx, sy, -rotation, dx2, dy2);
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    delete this.frameState;
    super.disposeInternal();
  }
};
var Layer_default2 = CanvasLayerRenderer;

export {
  ZIndexContext_default,
  canvasPool,
  Layer_default2 as Layer_default
};
//# sourceMappingURL=chunk-CB43P2IO.js.map
