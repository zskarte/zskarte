import {
  TileLayer_default
} from "./chunk-Y22DGWX5.js";
import {
  TileProperty_default
} from "./chunk-CYLATGCW.js";
import {
  TileState_default
} from "./chunk-WFUVBADM.js";
import {
  BuilderGroup_default,
  DECLUTTER,
  ExecutorGroup_default,
  HIT_DETECT_RESOLUTION,
  createHitDetectionImageData,
  getSquaredTolerance,
  hitDetect,
  renderFeature
} from "./chunk-QNDF4Y3D.js";
import {
  ZIndexContext_default
} from "./chunk-CB43P2IO.js";
import {
  BaseVector_default
} from "./chunk-V3CLUJMF.js";
import {
  toSize
} from "./chunk-EA4JZPIY.js";
import {
  ViewHint_default
} from "./chunk-PTY4IMKO.js";
import {
  apply,
  create,
  multiply,
  reset,
  scale,
  translate
} from "./chunk-5DM6XDPZ.js";
import {
  assert
} from "./chunk-IRDKPWWT.js";
import {
  wrapX
} from "./chunk-QPOUXWMH.js";
import {
  boundingExtent,
  buffer,
  containsExtent,
  equals,
  getIntersection,
  getTopLeft,
  intersects
} from "./chunk-IHYRLUFT.js";
import {
  getUid
} from "./chunk-JL7CNLN5.js";
import {
  ascending
} from "./chunk-LBIH33AC.js";

// ../../node_modules/ol/renderer/canvas/VectorTileLayer.js
var IMAGE_REPLAYS = {
  "image": ["Polygon", "Circle", "LineString", "Image", "Text"],
  "hybrid": ["Polygon", "LineString"],
  "vector": []
};
var VECTOR_REPLAYS = {
  "hybrid": ["Image", "Text", "Default"],
  "vector": ["Polygon", "Circle", "LineString", "Image", "Text", "Default"]
};
var CanvasVectorTileLayerRenderer = class extends TileLayer_default {
  /**
   * @param {import("../../layer/VectorTile.js").default} layer VectorTile layer.
   * @param {import("./TileLayer.js").Options} options Options.
   */
  constructor(layer, options) {
    super(layer, options);
    this.boundHandleStyleImageChange_ = this.handleStyleImageChange_.bind(this);
    this.renderedLayerRevision_;
    this.renderedPixelToCoordinateTransform_ = null;
    this.renderedRotation_;
    this.renderedOpacity_ = 1;
    this.tmpTransform_ = create();
    this.tileClipContexts_ = null;
  }
  /**
   * @param {import("../../VectorRenderTile.js").default} tile Tile.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {number} x Left of the tile.
   * @param {number} y Top of the tile.
   * @param {number} w Width of the tile.
   * @param {number} h Height of the tile.
   * @param {number} gutter Tile gutter.
   * @param {boolean} transition Apply an alpha transition.
   * @override
   */
  drawTile(tile, frameState, x, y, w, h, gutter, transition) {
    this.updateExecutorGroup_(tile, frameState.pixelRatio, frameState.viewState.projection);
    if (this.tileImageNeedsRender_(tile)) {
      this.renderTileImage_(tile, frameState);
    }
    super.drawTile(tile, frameState, x, y, w, h, gutter, transition);
  }
  /**
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {import("../../Tile.js").default|null} Tile (or null if outside source extent).
   * @override
   */
  getTile(z, x, y, frameState) {
    const tile = (
      /** @type {import("../../VectorRenderTile.js").default} */
      this.getOrCreateTile(z, x, y, frameState)
    );
    if (!tile) {
      return null;
    }
    const viewState = frameState.viewState;
    const resolution = viewState.resolution;
    const viewHints = frameState.viewHints;
    const hifi = !(viewHints[ViewHint_default.ANIMATING] || viewHints[ViewHint_default.INTERACTING]);
    if (hifi || !tile.wantedResolution) {
      tile.wantedResolution = resolution;
    }
    return tile;
  }
  /**
   * Determine whether render should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   * @override
   */
  prepareFrame(frameState) {
    const layerRevision = this.getLayer().getRevision();
    if (this.renderedLayerRevision_ !== layerRevision) {
      this.renderedLayerRevision_ = layerRevision;
      this.renderedTiles.length = 0;
    }
    return super.prepareFrame(frameState);
  }
  /**
   * @param {import("../../VectorRenderTile.js").default} tile Tile.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../../proj/Projection.js").default} projection Projection.
   * @private
   */
  updateExecutorGroup_(tile, pixelRatio, projection) {
    const layer = (
      /** @type {import("../../layer/VectorTile.js").default} */
      this.getLayer()
    );
    const revision = layer.getRevision();
    const renderOrder = layer.getRenderOrder() || null;
    const resolution = tile.wantedResolution;
    const builderState = tile.getReplayState(layer);
    if (!builderState.dirty && builderState.renderedResolution === resolution && builderState.renderedRevision == revision && builderState.renderedRenderOrder == renderOrder) {
      return;
    }
    const source = layer.getSource();
    const declutter = !!layer.getDeclutter();
    const sourceTileGrid = source.getTileGrid();
    const tileGrid = source.getTileGridForProjection(projection);
    const tileExtent = tileGrid.getTileCoordExtent(tile.wrappedTileCoord);
    const sourceTiles = source.getSourceTiles(pixelRatio, projection, tile);
    const layerUid = getUid(layer);
    delete tile.hitDetectionImageData[layerUid];
    tile.executorGroups[layerUid] = [];
    builderState.dirty = false;
    for (let t = 0, tt = sourceTiles.length; t < tt; ++t) {
      const sourceTile = sourceTiles[t];
      if (sourceTile.getState() != TileState_default.LOADED) {
        continue;
      }
      const sourceTileCoord = sourceTile.tileCoord;
      const sourceTileExtent = sourceTileGrid.getTileCoordExtent(sourceTileCoord);
      const sharedExtent = getIntersection(tileExtent, sourceTileExtent);
      const builderExtent = buffer(sharedExtent, layer.getRenderBuffer() * resolution, this.tempExtent);
      const bufferedExtent = equals(sourceTileExtent, sharedExtent) ? null : builderExtent;
      const builderGroup = new BuilderGroup_default(0, sharedExtent, resolution, pixelRatio);
      const squaredTolerance = getSquaredTolerance(resolution, pixelRatio);
      const render = function(feature, index) {
        let styles;
        const styleFunction = feature.getStyleFunction() || layer.getStyleFunction();
        if (styleFunction) {
          styles = styleFunction(feature, resolution);
        }
        if (styles) {
          const dirty = this.renderFeature(feature, squaredTolerance, styles, builderGroup, declutter, index);
          builderState.dirty = builderState.dirty || dirty;
        }
      };
      const features = sourceTile.getFeatures();
      if (renderOrder && renderOrder !== builderState.renderedRenderOrder) {
        features.sort(renderOrder);
      }
      for (let i = 0, ii = features.length; i < ii; ++i) {
        const feature = features[i];
        if (!bufferedExtent || intersects(bufferedExtent, feature.getGeometry().getExtent())) {
          render.call(this, feature, i);
        }
      }
      const executorGroupInstructions = builderGroup.finish();
      const replayExtent = layer.getRenderMode() !== "vector" && declutter && sourceTiles.length === 1 ? null : sharedExtent;
      const renderingReplayGroup = new ExecutorGroup_default(replayExtent, resolution, pixelRatio, source.getOverlaps(), executorGroupInstructions, layer.getRenderBuffer(), true);
      tile.executorGroups[layerUid].push(renderingReplayGroup);
    }
    builderState.renderedRevision = revision;
    builderState.renderedRenderOrder = renderOrder;
    builderState.renderedResolution = resolution;
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
    const resolution = frameState.viewState.resolution;
    const rotation = frameState.viewState.rotation;
    hitTolerance = hitTolerance == void 0 ? 0 : hitTolerance;
    const layer = this.getLayer();
    const source = layer.getSource();
    const tileGrid = source.getTileGridForProjection(frameState.viewState.projection);
    const hitExtent = boundingExtent([coordinate]);
    buffer(hitExtent, resolution * hitTolerance, hitExtent);
    const features = {};
    const featureCallback = function(feature, geometry, distanceSq) {
      let key = feature.getId();
      if (key === void 0) {
        key = getUid(feature);
      }
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
    const renderedTiles = (
      /** @type {Array<import("../../VectorRenderTile.js").default>} */
      this.renderedTiles
    );
    const layerUid = getUid(layer);
    const declutter = layer.getDeclutter();
    const declutteredFeatures = declutter ? frameState.declutter[declutter].all().map((item) => item.value) : null;
    let found;
    foundFeature: for (let i = 0, ii = renderedTiles.length; i < ii; ++i) {
      const tile = renderedTiles[i];
      const tileExtent = tileGrid.getTileCoordExtent(tile.wrappedTileCoord);
      if (!intersects(tileExtent, hitExtent)) {
        continue;
      }
      const executorGroups = tile.executorGroups[layerUid];
      for (let t = 0, tt = executorGroups.length; t < tt; ++t) {
        found = executorGroups[t].forEachFeatureAtCoordinate(coordinate, resolution, rotation, hitTolerance, featureCallback, declutteredFeatures);
        if (found) {
          break foundFeature;
        }
      }
    }
    return found;
  }
  /**
   * Asynchronous layer level hit detection.
   * @param {import("../../pixel.js").Pixel} pixel Pixel.
   * @return {Promise<Array<import("../../Feature.js").FeatureLike>>} Promise that resolves with an array of features.
   * @override
   */
  getFeatures(pixel) {
    if (this.renderedTiles.length === 0) {
      return Promise.resolve([]);
    }
    return new Promise((resolve, reject) => {
      const layer = this.getLayer();
      const source = layer.getSource();
      const projection = this.renderedProjection;
      const projectionExtent = projection.getExtent();
      const resolution = this.renderedResolution;
      const tileGrid = source.getTileGridForProjection(projection);
      const coordinate = apply(this.renderedPixelToCoordinateTransform_, pixel.slice());
      const tileCoordString = tileGrid.getTileCoordForCoordAndResolution(coordinate, resolution).toString();
      const tile = (
        /** @type {Array<import("../../VectorRenderTile.js").default>} */
        this.renderedTiles.find((tile2) => tile2.tileCoord.toString() === tileCoordString && tile2.getState() === TileState_default.LOADED)
      );
      if (!tile || tile.loadingSourceTiles > 0) {
        resolve([]);
        return;
      }
      if (source.getWrapX() && projection.canWrapX() && !containsExtent(projectionExtent, tileGrid.getTileCoordExtent(tile.tileCoord))) {
        wrapX(coordinate, projection);
      }
      const layerUid = getUid(layer);
      const extent = tileGrid.getTileCoordExtent(tile.wrappedTileCoord);
      const corner = getTopLeft(extent);
      const tilePixel = [(coordinate[0] - corner[0]) / resolution, (corner[1] - coordinate[1]) / resolution];
      const features = tile.getSourceTiles().reduce(
        (accumulator, sourceTile) => accumulator.concat(sourceTile.getFeatures()),
        /** @type {Array<import("../../Feature.js").FeatureLike>} */
        []
      );
      let hitDetectionImageData = tile.hitDetectionImageData[layerUid];
      if (!hitDetectionImageData) {
        const tileSize = toSize(tileGrid.getTileSize(tileGrid.getZForResolution(resolution, source.zDirection)));
        const rotation = this.renderedRotation_;
        const transforms = [this.getRenderTransform(tileGrid.getTileCoordCenter(tile.wrappedTileCoord), resolution, 0, HIT_DETECT_RESOLUTION, tileSize[0] * HIT_DETECT_RESOLUTION, tileSize[1] * HIT_DETECT_RESOLUTION, 0)];
        hitDetectionImageData = createHitDetectionImageData(tileSize, transforms, features, layer.getStyleFunction(), tileGrid.getTileCoordExtent(tile.wrappedTileCoord), tile.getReplayState(layer).renderedResolution, rotation);
        tile.hitDetectionImageData[layerUid] = hitDetectionImageData;
      }
      resolve(hitDetect(tilePixel, features, hitDetectionImageData));
    });
  }
  /**
   * @param {import("../../extent.js").Extent} extent Extent.
   * @return {Array<import('../../Feature.js').FeatureLike>} Features.
   */
  getFeaturesInExtent(extent) {
    const features = [];
    const tileCache = this.getTileCache();
    if (tileCache.getCount() === 0) {
      return features;
    }
    const source = this.getLayer().getSource();
    const tileGrid = source.getTileGridForProjection(this.frameState.viewState.projection);
    const z = tileGrid.getZForResolution(this.renderedResolution);
    const visitedSourceTiles = {};
    tileCache.forEach((tile) => {
      if (tile.tileCoord[0] !== z || tile.getState() !== TileState_default.LOADED) {
        return;
      }
      const sourceTiles = tile.getSourceTiles();
      for (let i = 0, ii = sourceTiles.length; i < ii; ++i) {
        const sourceTile = sourceTiles[i];
        const key = sourceTile.getKey();
        if (key in visitedSourceTiles) {
          continue;
        }
        visitedSourceTiles[key] = true;
        const tileCoord = sourceTile.tileCoord;
        if (intersects(extent, tileGrid.getTileCoordExtent(tileCoord))) {
          const tileFeatures = sourceTile.getFeatures();
          if (tileFeatures) {
            for (let j = 0, jj = tileFeatures.length; j < jj; ++j) {
              const candidate = tileFeatures[j];
              const geometry = candidate.getGeometry();
              if (intersects(extent, geometry.getExtent())) {
                features.push(candidate);
              }
            }
          }
        }
      }
    });
    return features;
  }
  /**
   * Perform action necessary to get the layer rendered after new fonts have loaded
   * @override
   */
  handleFontsChanged() {
    const layer = this.getLayer();
    if (layer.getVisible() && this.renderedLayerRevision_ !== void 0) {
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
   * Render declutter items for this layer
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {import("../../layer/Layer.js").State} layerState Layer state.
   */
  renderDeclutter(frameState, layerState) {
    const context = this.context;
    const alpha = context.globalAlpha;
    context.globalAlpha = layerState.opacity;
    const viewHints = frameState.viewHints;
    const hifi = !(viewHints[ViewHint_default.ANIMATING] || viewHints[ViewHint_default.INTERACTING]);
    const scaledCanvasSize = [this.context.canvas.width, this.context.canvas.height];
    const declutter = this.getLayer().getDeclutter();
    const declutterTree = declutter ? frameState.declutter[declutter] : void 0;
    const layerUid = getUid(this.getLayer());
    const tiles = (
      /** @type {Array<import("../../VectorRenderTile.js").default>} */
      this.renderedTiles
    );
    for (let i = 0, ii = tiles.length; i < ii; ++i) {
      const tile = tiles[i];
      const executorGroups = tile.executorGroups[layerUid];
      if (executorGroups) {
        for (let j = executorGroups.length - 1; j >= 0; --j) {
          executorGroups[j].execute(this.context, scaledCanvasSize, this.getTileRenderTransform(tile, frameState), frameState.viewState.rotation, hifi, DECLUTTER, declutterTree);
        }
      }
    }
    context.globalAlpha = alpha;
  }
  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @override
   */
  renderDeferredInternal(frameState) {
    const tiles = (
      /** @type {Array<import("../../VectorRenderTile.js").default>} */
      this.renderedTiles
    );
    const layerUid = getUid(this.getLayer());
    const executorGroups = tiles.reduce(
      (acc, tile, index) => {
        tile.executorGroups[layerUid].forEach((executorGroup) => acc.push({
          executorGroup,
          index
        }));
        return acc;
      },
      /** @type {Array<{executorGroup: CanvasExecutorGroup, index: number}>} */
      []
    );
    const executorGroupZIndexContexts = executorGroups.map(({
      executorGroup
    }) => executorGroup.getDeferredZIndexContexts());
    const usedZIndices = {};
    for (let i = 0, ii = executorGroups.length; i < ii; ++i) {
      const executorGroupZindexContext = executorGroups[i].executorGroup.getDeferredZIndexContexts();
      for (const key in executorGroupZindexContext) {
        usedZIndices[key] = true;
      }
    }
    const zIndexKeys = Object.keys(usedZIndices).map(Number).sort(ascending);
    zIndexKeys.forEach((zIndex) => {
      executorGroupZIndexContexts.forEach((zIndexContexts, i) => {
        if (!zIndexContexts[zIndex]) {
          return;
        }
        zIndexContexts[zIndex].forEach((zIndexContext) => {
          const {
            executorGroup,
            index
          } = executorGroups[i];
          const context = executorGroup.getRenderedContext();
          const alpha = context.globalAlpha;
          context.globalAlpha = this.renderedOpacity_;
          const tileClipContext = this.tileClipContexts_[index];
          if (tileClipContext) {
            tileClipContext.draw(context);
          }
          zIndexContext.draw(context);
          if (tileClipContext) {
            context.restore();
          }
          context.globalAlpha = alpha;
          zIndexContext.clear();
        });
        zIndexContexts[zIndex].length = 0;
      });
    });
  }
  /**
   * @param {import("../../VectorRenderTile.js").default} tile The tile
   * @param {import('../../Map.js').FrameState} frameState Current frame state
   * @return {import('../../transform.js').Transform} Transform to use to render this tile
   */
  getTileRenderTransform(tile, frameState) {
    const pixelRatio = frameState.pixelRatio;
    const viewState = frameState.viewState;
    const center = viewState.center;
    const resolution = viewState.resolution;
    const rotation = viewState.rotation;
    const size = frameState.size;
    const width = Math.round(size[0] * pixelRatio);
    const height = Math.round(size[1] * pixelRatio);
    const source = this.getLayer().getSource();
    const tileGrid = source.getTileGridForProjection(frameState.viewState.projection);
    const tileCoord = tile.tileCoord;
    const tileExtent = tileGrid.getTileCoordExtent(tile.wrappedTileCoord);
    const worldOffset = tileGrid.getTileCoordExtent(tileCoord, this.tempExtent)[0] - tileExtent[0];
    const transform = multiply(scale(this.inversePixelTransform.slice(), 1 / pixelRatio, 1 / pixelRatio), this.getRenderTransform(center, resolution, rotation, pixelRatio, width, height, worldOffset));
    return transform;
  }
  /**
   * Render the vectors for this layer.
   * @param {CanvasRenderingContext2D} context Target context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @override
   */
  postRender(context, frameState) {
    const viewHints = frameState.viewHints;
    const hifi = !(viewHints[ViewHint_default.ANIMATING] || viewHints[ViewHint_default.INTERACTING]);
    this.renderedPixelToCoordinateTransform_ = frameState.pixelToCoordinateTransform.slice();
    this.renderedRotation_ = frameState.viewState.rotation;
    this.renderedOpacity_ = frameState.layerStatesArray[frameState.layerIndex].opacity;
    const layer = (
      /** @type {import("../../layer/VectorTile.js").default} */
      this.getLayer()
    );
    const renderMode = layer.getRenderMode();
    const alpha = context.globalAlpha;
    context.globalAlpha = this.renderedOpacity_;
    const declutter = layer.getDeclutter();
    const replayTypes = declutter ? VECTOR_REPLAYS[renderMode].filter((type) => !DECLUTTER.includes(type)) : VECTOR_REPLAYS[renderMode];
    const viewState = frameState.viewState;
    const rotation = viewState.rotation;
    const tileSource = layer.getSource();
    const tileGrid = tileSource.getTileGridForProjection(viewState.projection);
    const z = tileGrid.getZForResolution(viewState.resolution, tileSource.zDirection);
    const tiles = (
      /** @type {Array<import("../../VectorRenderTile.js").default>} */
      this.renderedTiles
    );
    const clips = [];
    const clipZs = [];
    const tileClipContexts = [];
    const layerUid = getUid(layer);
    let ready = true;
    for (let i = tiles.length - 1; i >= 0; --i) {
      const tile = tiles[i];
      ready = ready && !tile.getReplayState(layer).dirty;
      const executorGroups = tile.executorGroups[layerUid].filter((group) => group.hasExecutors(replayTypes));
      if (executorGroups.length === 0) {
        continue;
      }
      const transform = this.getTileRenderTransform(tile, frameState);
      const currentZ = tile.tileCoord[0];
      let contextSaved = false;
      const currentClip = executorGroups[0].getClipCoords(transform);
      let clipContext = context;
      let tileClipContext;
      if (currentClip) {
        tileClipContext = new ZIndexContext_default();
        clipContext = tileClipContext.getContext();
        for (let j = 0, jj = clips.length; j < jj; ++j) {
          if (z !== currentZ && currentZ < clipZs[j]) {
            const clip = clips[j];
            if (intersects([currentClip[0], currentClip[3], currentClip[4], currentClip[7]], [clip[0], clip[3], clip[4], clip[7]])) {
              if (!contextSaved) {
                clipContext.save();
                contextSaved = true;
              }
              clipContext.beginPath();
              clipContext.moveTo(currentClip[0], currentClip[1]);
              clipContext.lineTo(currentClip[2], currentClip[3]);
              clipContext.lineTo(currentClip[4], currentClip[5]);
              clipContext.lineTo(currentClip[6], currentClip[7]);
              clipContext.moveTo(clip[6], clip[7]);
              clipContext.lineTo(clip[4], clip[5]);
              clipContext.lineTo(clip[2], clip[3]);
              clipContext.lineTo(clip[0], clip[1]);
              clipContext.clip();
            }
          }
        }
        clips.push(currentClip);
        clipZs.push(currentZ);
      }
      for (let t = 0, tt = executorGroups.length; t < tt; ++t) {
        const executorGroup = executorGroups[t];
        executorGroup.execute(context, [context.canvas.width, context.canvas.height], transform, rotation, hifi, replayTypes, frameState.declutter?.[declutter]);
      }
      if (contextSaved) {
        if (clipContext === context) {
          clipContext.restore();
        } else {
          tileClipContexts[i] = tileClipContext;
        }
      }
    }
    context.globalAlpha = alpha;
    this.ready = ready;
    this.tileClipContexts_ = tileClipContexts;
    if (!frameState.declutter) {
      this.renderDeferredInternal(frameState);
    }
    super.postRender(context, frameState);
  }
  /**
   * @param {import("../../Feature.js").FeatureLike} feature Feature.
   * @param {number} squaredTolerance Squared tolerance.
   * @param {import("../../style/Style.js").default|Array<import("../../style/Style.js").default>} styles The style or array of styles.
   * @param {import("../../render/canvas/BuilderGroup.js").default} builderGroup Replay group.
   * @param {boolean} [declutter] Enable decluttering.
   * @param {number} [index] Render order index.
   * @return {boolean} `true` if an image is loading.
   */
  renderFeature(feature, squaredTolerance, styles, builderGroup, declutter, index) {
    if (!styles) {
      return false;
    }
    let loading = false;
    if (Array.isArray(styles)) {
      for (let i = 0, ii = styles.length; i < ii; ++i) {
        loading = renderFeature(builderGroup, feature, styles[i], squaredTolerance, this.boundHandleStyleImageChange_, void 0, declutter, index) || loading;
      }
    } else {
      loading = renderFeature(builderGroup, feature, styles, squaredTolerance, this.boundHandleStyleImageChange_, void 0, declutter, index);
    }
    return loading;
  }
  /**
   * @param {import("../../VectorRenderTile.js").default} tile Tile.
   * @return {boolean} A new tile image was rendered.
   * @private
   */
  tileImageNeedsRender_(tile) {
    const layer = (
      /** @type {import("../../layer/VectorTile.js").default} */
      this.getLayer()
    );
    if (layer.getRenderMode() === "vector") {
      return false;
    }
    const replayState = tile.getReplayState(layer);
    const revision = layer.getRevision();
    const resolution = tile.wantedResolution;
    return replayState.renderedTileResolution !== resolution || replayState.renderedTileRevision !== revision;
  }
  /**
   * @param {import("../../VectorRenderTile.js").default} tile Tile.
   * @param {import("../../Map").FrameState} frameState Frame state.
   * @private
   */
  renderTileImage_(tile, frameState) {
    const layer = (
      /** @type {import("../../layer/VectorTile.js").default} */
      this.getLayer()
    );
    const replayState = tile.getReplayState(layer);
    const revision = layer.getRevision();
    const executorGroups = tile.executorGroups[getUid(layer)];
    replayState.renderedTileRevision = revision;
    const tileCoord = tile.wrappedTileCoord;
    const z = tileCoord[0];
    const source = layer.getSource();
    let pixelRatio = frameState.pixelRatio;
    const viewState = frameState.viewState;
    const projection = viewState.projection;
    const tileGrid = source.getTileGridForProjection(projection);
    const tileResolution = tileGrid.getResolution(tile.tileCoord[0]);
    const renderPixelRatio = frameState.pixelRatio / tile.wantedResolution * tileResolution;
    const resolution = tileGrid.getResolution(z);
    const context = tile.getContext();
    pixelRatio = Math.round(Math.max(pixelRatio, renderPixelRatio / pixelRatio));
    const size = source.getTilePixelSize(z, pixelRatio, projection);
    context.canvas.width = size[0];
    context.canvas.height = size[1];
    const renderScale = pixelRatio / renderPixelRatio;
    if (renderScale !== 1) {
      const canvasTransform = reset(this.tmpTransform_);
      scale(canvasTransform, renderScale, renderScale);
      context.setTransform.apply(context, canvasTransform);
    }
    const tileExtent = tileGrid.getTileCoordExtent(tileCoord, this.tempExtent);
    const pixelScale = renderPixelRatio / resolution;
    const transform = reset(this.tmpTransform_);
    scale(transform, pixelScale, -pixelScale);
    translate(transform, -tileExtent[0], -tileExtent[3]);
    for (let i = 0, ii = executorGroups.length; i < ii; ++i) {
      const executorGroup = executorGroups[i];
      executorGroup.execute(context, [context.canvas.width * renderScale, context.canvas.height * renderScale], transform, 0, true, IMAGE_REPLAYS[layer.getRenderMode()], null);
    }
    replayState.renderedTileResolution = tile.wantedResolution;
  }
};
var VectorTileLayer_default = CanvasVectorTileLayerRenderer;

// ../../node_modules/ol/layer/VectorTile.js
var VectorTileLayer = class extends BaseVector_default {
  /**
   * @param {Options<VectorTileSourceType, FeatureType>} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};
    const baseOptions = Object.assign({}, options);
    delete baseOptions.preload;
    const cacheSize = options.cacheSize === void 0 ? 0 : options.cacheSize;
    delete options.cacheSize;
    delete baseOptions.useInterimTilesOnError;
    super(baseOptions);
    this.on;
    this.once;
    this.un;
    this.cacheSize_ = cacheSize;
    const renderMode = options.renderMode || "hybrid";
    assert(renderMode == "hybrid" || renderMode == "vector", "`renderMode` must be `'hybrid'` or `'vector'`");
    this.renderMode_ = renderMode;
    this.setPreload(options.preload ? options.preload : 0);
    this.setUseInterimTilesOnError(options.useInterimTilesOnError !== void 0 ? options.useInterimTilesOnError : true);
    this.getBackground;
    this.setBackground;
  }
  /**
   * @override
   */
  createRenderer() {
    return new VectorTileLayer_default(this, {
      cacheSize: this.cacheSize_
    });
  }
  /**
   * Get the topmost feature that intersects the given pixel on the viewport. Returns a promise
   * that resolves with an array of features. The array will either contain the topmost feature
   * when a hit was detected, or it will be empty.
   *
   * The hit detection algorithm used for this method is optimized for performance, but is less
   * accurate than the one used in [map.getFeaturesAtPixel()]{@link import("../Map.js").default#getFeaturesAtPixel}.
   * Text is not considered, and icons are only represented by their bounding box instead of the exact
   * image.
   *
   * @param {import("../pixel.js").Pixel} pixel Pixel.
   * @return {Promise<Array<import("../Feature").FeatureLike>>} Promise that resolves with an array of features.
   * @api
   * @override
   */
  getFeatures(pixel) {
    return super.getFeatures(pixel);
  }
  /**
   * Get features whose bounding box intersects the provided extent. Only features for cached
   * tiles for the last rendered zoom level are available in the source. So this method is only
   * suitable for requesting tiles for extents that are currently rendered.
   *
   * Features are returned in random tile order and as they are included in the tiles. This means
   * they can be clipped, duplicated across tiles, and simplified to the render resolution.
   *
   * @param {import("../extent.js").Extent} extent Extent.
   * @return {Array<FeatureType>} Features.
   * @api
   */
  getFeaturesInExtent(extent) {
    return (
      /** @type {Array<FeatureType>} */
      /** @type {*} */
      this.getRenderer().getFeaturesInExtent(extent)
    );
  }
  /**
   * @return {VectorTileRenderType} The render mode.
   */
  getRenderMode() {
    return this.renderMode_;
  }
  /**
   * Return the level as number to which we will preload tiles up to.
   * @return {number} The level to preload tiles up to.
   * @observable
   * @api
   */
  getPreload() {
    return (
      /** @type {number} */
      this.get(TileProperty_default.PRELOAD)
    );
  }
  /**
   * Deprecated.  Whether we use interim tiles on error.
   * @return {boolean} Use interim tiles on error.
   * @observable
   * @api
   */
  getUseInterimTilesOnError() {
    return (
      /** @type {boolean} */
      this.get(TileProperty_default.USE_INTERIM_TILES_ON_ERROR)
    );
  }
  /**
   * Set the level as number to which we will preload tiles up to.
   * @param {number} preload The level to preload tiles up to.
   * @observable
   * @api
   */
  setPreload(preload) {
    this.set(TileProperty_default.PRELOAD, preload);
  }
  /**
   * Deprecated.  Set whether we use interim tiles on error.
   * @param {boolean} useInterimTilesOnError Use interim tiles on error.
   * @observable
   * @api
   */
  setUseInterimTilesOnError(useInterimTilesOnError) {
    this.set(TileProperty_default.USE_INTERIM_TILES_ON_ERROR, useInterimTilesOnError);
  }
};
var VectorTile_default = VectorTileLayer;

export {
  VectorTile_default
};
//# sourceMappingURL=chunk-GQNRDIV4.js.map
