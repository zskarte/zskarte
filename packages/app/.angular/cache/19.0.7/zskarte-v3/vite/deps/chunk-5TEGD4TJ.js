import {
  ALL,
  BuilderGroup_default,
  DECLUTTER,
  ExecutorGroup_default,
  HIT_DETECT_RESOLUTION,
  NON_DECLUTTER,
  createHitDetectionImageData,
  defaultOrder,
  getSquaredTolerance,
  getTolerance,
  hitDetect,
  renderFeature
} from "./chunk-QNDF4Y3D.js";
import {
  Layer_default,
  canvasPool
} from "./chunk-CB43P2IO.js";
import {
  BaseVector_default
} from "./chunk-V3CLUJMF.js";
import {
  EventType_default
} from "./chunk-3JTXEXYF.js";
import {
  createCanvasContext2D,
  releaseCanvas
} from "./chunk-73LIRBW3.js";
import {
  ViewHint_default
} from "./chunk-PTY4IMKO.js";
import {
  fromUserExtent,
  getTransformFromProjections,
  getUserProjection,
  toUserExtent,
  toUserResolution,
  wrapX as wrapX2
} from "./chunk-QPOUXWMH.js";
import {
  buffer,
  containsExtent,
  createEmpty,
  getHeight,
  getWidth,
  intersects,
  wrapX
} from "./chunk-IHYRLUFT.js";
import {
  getUid
} from "./chunk-JL7CNLN5.js";
import {
  equals
} from "./chunk-LBIH33AC.js";

// ../../node_modules/ol/renderer/canvas/VectorLayer.js
var CanvasVectorLayerRenderer = class extends Layer_default {
  /**
   * @param {import("../../layer/BaseVector.js").default} vectorLayer Vector layer.
   */
  constructor(vectorLayer) {
    super(vectorLayer);
    this.boundHandleStyleImageChange_ = this.handleStyleImageChange_.bind(this);
    this.animatingOrInteracting_;
    this.hitDetectionImageData_ = null;
    this.clipped_ = false;
    this.renderedFeatures_ = null;
    this.renderedRevision_ = -1;
    this.renderedResolution_ = NaN;
    this.renderedExtent_ = createEmpty();
    this.wrappedRenderedExtent_ = createEmpty();
    this.renderedRotation_;
    this.renderedCenter_ = null;
    this.renderedProjection_ = null;
    this.renderedPixelRatio_ = 1;
    this.renderedRenderOrder_ = null;
    this.renderedFrameDeclutter_;
    this.replayGroup_ = null;
    this.replayGroupChanged = true;
    this.clipping = true;
    this.targetContext_ = null;
    this.opacity_ = 1;
  }
  /**
   * @param {ExecutorGroup} executorGroup Executor group.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {boolean} [declutterable] `true` to only render declutterable items,
   *     `false` to only render non-declutterable items, `undefined` to render all.
   */
  renderWorlds(executorGroup, frameState, declutterable) {
    const extent = frameState.extent;
    const viewState = frameState.viewState;
    const center = viewState.center;
    const resolution = viewState.resolution;
    const projection = viewState.projection;
    const rotation = viewState.rotation;
    const projectionExtent = projection.getExtent();
    const vectorSource = this.getLayer().getSource();
    const declutter = this.getLayer().getDeclutter();
    const pixelRatio = frameState.pixelRatio;
    const viewHints = frameState.viewHints;
    const snapToPixel = !(viewHints[ViewHint_default.ANIMATING] || viewHints[ViewHint_default.INTERACTING]);
    const context = this.context;
    const width = Math.round(getWidth(extent) / resolution * pixelRatio);
    const height = Math.round(getHeight(extent) / resolution * pixelRatio);
    const multiWorld = vectorSource.getWrapX() && projection.canWrapX();
    const worldWidth = multiWorld ? getWidth(projectionExtent) : null;
    const endWorld = multiWorld ? Math.ceil((extent[2] - projectionExtent[2]) / worldWidth) + 1 : 1;
    let world = multiWorld ? Math.floor((extent[0] - projectionExtent[0]) / worldWidth) : 0;
    do {
      let transform = this.getRenderTransform(center, resolution, 0, pixelRatio, width, height, world * worldWidth);
      if (frameState.declutter) {
        transform = transform.slice(0);
      }
      executorGroup.execute(context, [context.canvas.width, context.canvas.height], transform, rotation, snapToPixel, declutterable === void 0 ? ALL : declutterable ? DECLUTTER : NON_DECLUTTER, declutterable ? declutter && frameState.declutter[declutter] : void 0);
    } while (++world < endWorld);
  }
  /**
   * @private
   */
  setDrawContext_() {
    if (this.opacity_ !== 1) {
      this.targetContext_ = this.context;
      this.context = createCanvasContext2D(this.context.canvas.width, this.context.canvas.height, canvasPool);
    }
  }
  /**
   * @private
   */
  resetDrawContext_() {
    if (this.opacity_ !== 1) {
      const alpha = this.targetContext_.globalAlpha;
      this.targetContext_.globalAlpha = this.opacity_;
      this.targetContext_.drawImage(this.context.canvas, 0, 0);
      this.targetContext_.globalAlpha = alpha;
      releaseCanvas(this.context);
      canvasPool.push(this.context.canvas);
      this.context = this.targetContext_;
      this.targetContext_ = null;
    }
  }
  /**
   * Render declutter items for this layer
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   */
  renderDeclutter(frameState) {
    if (!this.replayGroup_ || !this.getLayer().getDeclutter()) {
      return;
    }
    this.renderWorlds(this.replayGroup_, frameState, true);
  }
  /**
   * Render deferred instructions.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @override
   */
  renderDeferredInternal(frameState) {
    if (!this.replayGroup_) {
      return;
    }
    this.replayGroup_.renderDeferred();
    if (this.clipped_) {
      this.context.restore();
    }
    this.resetDrawContext_();
  }
  /**
   * Render the layer.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {HTMLElement|null} target Target that may be used to render content to.
   * @return {HTMLElement|null} The rendered element.
   * @override
   */
  renderFrame(frameState, target) {
    const layerState = frameState.layerStatesArray[frameState.layerIndex];
    this.opacity_ = layerState.opacity;
    const viewState = frameState.viewState;
    this.prepareContainer(frameState, target);
    const context = this.context;
    const replayGroup = this.replayGroup_;
    let render = replayGroup && !replayGroup.isEmpty();
    if (!render) {
      const hasRenderListeners = this.getLayer().hasListener(EventType_default.PRERENDER) || this.getLayer().hasListener(EventType_default.POSTRENDER);
      if (!hasRenderListeners) {
        return null;
      }
    }
    this.setDrawContext_();
    this.preRender(context, frameState);
    const projection = viewState.projection;
    this.clipped_ = false;
    if (render && layerState.extent && this.clipping) {
      const layerExtent = fromUserExtent(layerState.extent, projection);
      render = intersects(layerExtent, frameState.extent);
      this.clipped_ = render && !containsExtent(layerExtent, frameState.extent);
      if (this.clipped_) {
        this.clipUnrotated(context, frameState, layerExtent);
      }
    }
    if (render) {
      this.renderWorlds(replayGroup, frameState, this.getLayer().getDeclutter() ? false : void 0);
    }
    if (!frameState.declutter && this.clipped_) {
      context.restore();
    }
    this.postRender(context, frameState);
    if (this.renderedRotation_ !== viewState.rotation) {
      this.renderedRotation_ = viewState.rotation;
      this.hitDetectionImageData_ = null;
    }
    if (!frameState.declutter) {
      this.resetDrawContext_();
    }
    return this.container;
  }
  /**
   * Asynchronous layer level hit detection.
   * @param {import("../../pixel.js").Pixel} pixel Pixel.
   * @return {Promise<Array<import("../../Feature").default>>} Promise
   * that resolves with an array of features.
   * @override
   */
  getFeatures(pixel) {
    return new Promise((resolve) => {
      if (this.frameState && !this.hitDetectionImageData_ && !this.animatingOrInteracting_) {
        const size = this.frameState.size.slice();
        const center = this.renderedCenter_;
        const resolution = this.renderedResolution_;
        const rotation = this.renderedRotation_;
        const projection = this.renderedProjection_;
        const extent = this.wrappedRenderedExtent_;
        const layer = this.getLayer();
        const transforms = [];
        const width = size[0] * HIT_DETECT_RESOLUTION;
        const height = size[1] * HIT_DETECT_RESOLUTION;
        transforms.push(this.getRenderTransform(center, resolution, rotation, HIT_DETECT_RESOLUTION, width, height, 0).slice());
        const source = layer.getSource();
        const projectionExtent = projection.getExtent();
        if (source.getWrapX() && projection.canWrapX() && !containsExtent(projectionExtent, extent)) {
          let startX = extent[0];
          const worldWidth = getWidth(projectionExtent);
          let world = 0;
          let offsetX;
          while (startX < projectionExtent[0]) {
            --world;
            offsetX = worldWidth * world;
            transforms.push(this.getRenderTransform(center, resolution, rotation, HIT_DETECT_RESOLUTION, width, height, offsetX).slice());
            startX += worldWidth;
          }
          world = 0;
          startX = extent[2];
          while (startX > projectionExtent[2]) {
            ++world;
            offsetX = worldWidth * world;
            transforms.push(this.getRenderTransform(center, resolution, rotation, HIT_DETECT_RESOLUTION, width, height, offsetX).slice());
            startX -= worldWidth;
          }
        }
        const userProjection = getUserProjection();
        this.hitDetectionImageData_ = createHitDetectionImageData(size, transforms, this.renderedFeatures_, layer.getStyleFunction(), extent, resolution, rotation, getSquaredTolerance(resolution, this.renderedPixelRatio_), userProjection ? projection : null);
      }
      resolve(hitDetect(pixel, this.renderedFeatures_, this.hitDetectionImageData_));
    });
  }
  /**
   * @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {number} hitTolerance Hit tolerance in pixels.
   * @param {import("../vector.js").FeatureCallback<T>} callback Feature callback.
   * @param {Array<import("../Map.js").HitMatch<T>>} matches The hit detected matches with tolerance.
   * @return {T|undefined} Callback result.
   * @template T
   * @override
   */
  forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, matches) {
    if (!this.replayGroup_) {
      return void 0;
    }
    const resolution = frameState.viewState.resolution;
    const rotation = frameState.viewState.rotation;
    const layer = this.getLayer();
    const features = {};
    const featureCallback = function(feature, geometry, distanceSq) {
      const key = getUid(feature);
      const match = features[key];
      if (!match) {
        if (distanceSq === 0) {
          features[key] = true;
          return callback(feature, layer, geometry);
        }
        matches.push(features[key] = {
          feature,
          layer,
          geometry,
          distanceSq,
          callback
        });
      } else if (match !== true && distanceSq < match.distanceSq) {
        if (distanceSq === 0) {
          features[key] = true;
          matches.splice(matches.lastIndexOf(match), 1);
          return callback(feature, layer, geometry);
        }
        match.geometry = geometry;
        match.distanceSq = distanceSq;
      }
      return void 0;
    };
    const declutter = this.getLayer().getDeclutter();
    return this.replayGroup_.forEachFeatureAtCoordinate(coordinate, resolution, rotation, hitTolerance, featureCallback, declutter ? frameState.declutter[declutter].all().map((item) => item.value) : null);
  }
  /**
   * Perform action necessary to get the layer rendered after new fonts have loaded
   * @override
   */
  handleFontsChanged() {
    const layer = this.getLayer();
    if (layer.getVisible() && this.replayGroup_) {
      layer.changed();
    }
  }
  /**
   * Handle changes in image style state.
   * @param {import("../../events/Event.js").default} event Image style change event.
   * @private
   */
  handleStyleImageChange_(event) {
    this.renderIfReadyAndVisible();
  }
  /**
   * Determine whether render should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   * @override
   */
  prepareFrame(frameState) {
    const vectorLayer = this.getLayer();
    const vectorSource = vectorLayer.getSource();
    if (!vectorSource) {
      return false;
    }
    const animating = frameState.viewHints[ViewHint_default.ANIMATING];
    const interacting = frameState.viewHints[ViewHint_default.INTERACTING];
    const updateWhileAnimating = vectorLayer.getUpdateWhileAnimating();
    const updateWhileInteracting = vectorLayer.getUpdateWhileInteracting();
    if (this.ready && !updateWhileAnimating && animating || !updateWhileInteracting && interacting) {
      this.animatingOrInteracting_ = true;
      return true;
    }
    this.animatingOrInteracting_ = false;
    const frameStateExtent = frameState.extent;
    const viewState = frameState.viewState;
    const projection = viewState.projection;
    const resolution = viewState.resolution;
    const pixelRatio = frameState.pixelRatio;
    const vectorLayerRevision = vectorLayer.getRevision();
    const vectorLayerRenderBuffer = vectorLayer.getRenderBuffer();
    let vectorLayerRenderOrder = vectorLayer.getRenderOrder();
    if (vectorLayerRenderOrder === void 0) {
      vectorLayerRenderOrder = defaultOrder;
    }
    const center = viewState.center.slice();
    const extent = buffer(frameStateExtent, vectorLayerRenderBuffer * resolution);
    const renderedExtent = extent.slice();
    const loadExtents = [extent.slice()];
    const projectionExtent = projection.getExtent();
    if (vectorSource.getWrapX() && projection.canWrapX() && !containsExtent(projectionExtent, frameState.extent)) {
      const worldWidth = getWidth(projectionExtent);
      const gutter = Math.max(getWidth(extent) / 2, worldWidth);
      extent[0] = projectionExtent[0] - gutter;
      extent[2] = projectionExtent[2] + gutter;
      wrapX2(center, projection);
      const loadExtent = wrapX(loadExtents[0], projection);
      if (loadExtent[0] < projectionExtent[0] && loadExtent[2] < projectionExtent[2]) {
        loadExtents.push([loadExtent[0] + worldWidth, loadExtent[1], loadExtent[2] + worldWidth, loadExtent[3]]);
      } else if (loadExtent[0] > projectionExtent[0] && loadExtent[2] > projectionExtent[2]) {
        loadExtents.push([loadExtent[0] - worldWidth, loadExtent[1], loadExtent[2] - worldWidth, loadExtent[3]]);
      }
    }
    if (this.ready && this.renderedResolution_ == resolution && this.renderedRevision_ == vectorLayerRevision && this.renderedRenderOrder_ == vectorLayerRenderOrder && this.renderedFrameDeclutter_ === !!frameState.declutter && containsExtent(this.wrappedRenderedExtent_, extent)) {
      if (!equals(this.renderedExtent_, renderedExtent)) {
        this.hitDetectionImageData_ = null;
        this.renderedExtent_ = renderedExtent;
      }
      this.renderedCenter_ = center;
      this.replayGroupChanged = false;
      return true;
    }
    this.replayGroup_ = null;
    const replayGroup = new BuilderGroup_default(getTolerance(resolution, pixelRatio), extent, resolution, pixelRatio);
    const userProjection = getUserProjection();
    let userTransform;
    if (userProjection) {
      for (let i = 0, ii = loadExtents.length; i < ii; ++i) {
        const extent2 = loadExtents[i];
        const userExtent2 = toUserExtent(extent2, projection);
        vectorSource.loadFeatures(userExtent2, toUserResolution(resolution, projection), userProjection);
      }
      userTransform = getTransformFromProjections(userProjection, projection);
    } else {
      for (let i = 0, ii = loadExtents.length; i < ii; ++i) {
        vectorSource.loadFeatures(loadExtents[i], resolution, projection);
      }
    }
    const squaredTolerance = getSquaredTolerance(resolution, pixelRatio);
    let ready = true;
    const render = (
      /**
       * @param {import("../../Feature.js").default} feature Feature.
       * @param {number} index Index.
       */
      (feature, index) => {
        let styles;
        const styleFunction = feature.getStyleFunction() || vectorLayer.getStyleFunction();
        if (styleFunction) {
          styles = styleFunction(feature, resolution);
        }
        if (styles) {
          const dirty = this.renderFeature(feature, squaredTolerance, styles, replayGroup, userTransform, this.getLayer().getDeclutter(), index);
          ready = ready && !dirty;
        }
      }
    );
    const userExtent = toUserExtent(extent, projection);
    const features = vectorSource.getFeaturesInExtent(userExtent);
    if (vectorLayerRenderOrder) {
      features.sort(vectorLayerRenderOrder);
    }
    for (let i = 0, ii = features.length; i < ii; ++i) {
      render(features[i], i);
    }
    this.renderedFeatures_ = features;
    this.ready = ready;
    const replayGroupInstructions = replayGroup.finish();
    const executorGroup = new ExecutorGroup_default(extent, resolution, pixelRatio, vectorSource.getOverlaps(), replayGroupInstructions, vectorLayer.getRenderBuffer(), !!frameState.declutter);
    this.renderedResolution_ = resolution;
    this.renderedRevision_ = vectorLayerRevision;
    this.renderedRenderOrder_ = vectorLayerRenderOrder;
    this.renderedFrameDeclutter_ = !!frameState.declutter;
    this.renderedExtent_ = renderedExtent;
    this.wrappedRenderedExtent_ = extent;
    this.renderedCenter_ = center;
    this.renderedProjection_ = projection;
    this.renderedPixelRatio_ = pixelRatio;
    this.replayGroup_ = executorGroup;
    this.hitDetectionImageData_ = null;
    this.replayGroupChanged = true;
    return true;
  }
  /**
   * @param {import("../../Feature.js").default} feature Feature.
   * @param {number} squaredTolerance Squared render tolerance.
   * @param {import("../../style/Style.js").default|Array<import("../../style/Style.js").default>} styles The style or array of styles.
   * @param {import("../../render/canvas/BuilderGroup.js").default} builderGroup Builder group.
   * @param {import("../../proj.js").TransformFunction} [transform] Transform from user to view projection.
   * @param {boolean} [declutter] Enable decluttering.
   * @param {number} [index] Render order index.
   * @return {boolean} `true` if an image is loading.
   */
  renderFeature(feature, squaredTolerance, styles, builderGroup, transform, declutter, index) {
    if (!styles) {
      return false;
    }
    let loading = false;
    if (Array.isArray(styles)) {
      for (let i = 0, ii = styles.length; i < ii; ++i) {
        loading = renderFeature(builderGroup, feature, styles[i], squaredTolerance, this.boundHandleStyleImageChange_, transform, declutter, index) || loading;
      }
    } else {
      loading = renderFeature(builderGroup, feature, styles, squaredTolerance, this.boundHandleStyleImageChange_, transform, declutter, index);
    }
    return loading;
  }
};
var VectorLayer_default = CanvasVectorLayerRenderer;

// ../../node_modules/ol/layer/Vector.js
var VectorLayer = class extends BaseVector_default {
  /**
   * @param {Options<VectorSourceType, FeatureType>} [options] Options.
   */
  constructor(options) {
    super(options);
  }
  /**
   * @override
   */
  createRenderer() {
    return new VectorLayer_default(this);
  }
};
var Vector_default = VectorLayer;

export {
  VectorLayer_default,
  Vector_default
};
//# sourceMappingURL=chunk-5TEGD4TJ.js.map
