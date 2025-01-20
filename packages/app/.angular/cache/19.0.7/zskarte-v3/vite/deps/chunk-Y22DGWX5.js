import {
  Tile_default
} from "./chunk-UWFFTJUF.js";
import {
  LRUCache_default
} from "./chunk-ZFJPLISK.js";
import {
  ImageTile_default
} from "./chunk-6NF3VXQE.js";
import {
  DataTile_default,
  DataTile_default2,
  asImageLike
} from "./chunk-PMSTMQL3.js";
import {
  TileRange_default
} from "./chunk-K5VWTFZZ.js";
import {
  createOrUpdate,
  getKeyZXY
} from "./chunk-ABQOD32P.js";
import {
  TileState_default
} from "./chunk-WFUVBADM.js";
import {
  Layer_default
} from "./chunk-CB43P2IO.js";
import {
  toSize
} from "./chunk-EA4JZPIY.js";
import {
  apply,
  compose
} from "./chunk-5DM6XDPZ.js";
import {
  fromUserExtent
} from "./chunk-QPOUXWMH.js";
import {
  containsCoordinate,
  createEmpty,
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

// ../../node_modules/ol/renderer/canvas/TileLayer.js
function getCacheKey(sourceKey, z, x, y) {
  return `${sourceKey},${getKeyZXY(z, x, y)}`;
}
function addTileToLookup(tilesByZ, tile, z) {
  if (!(z in tilesByZ)) {
    tilesByZ[z] = /* @__PURE__ */ new Set([tile]);
    return true;
  }
  const set = tilesByZ[z];
  const existing = set.has(tile);
  if (!existing) {
    set.add(tile);
  }
  return !existing;
}
function removeTileFromLookup(tilesByZ, tile, z) {
  const set = tilesByZ[z];
  if (set) {
    return set.delete(tile);
  }
  return false;
}
function getRenderExtent(frameState, extent) {
  const layerState = frameState.layerStatesArray[frameState.layerIndex];
  if (layerState.extent) {
    extent = getIntersection(extent, fromUserExtent(layerState.extent, frameState.viewState.projection));
  }
  const source = (
    /** @type {import("../../source/Tile.js").default} */
    layerState.layer.getRenderSource()
  );
  if (!source.getWrapX()) {
    const gridExtent = source.getTileGridForProjection(frameState.viewState.projection).getExtent();
    if (gridExtent) {
      extent = getIntersection(extent, gridExtent);
    }
  }
  return extent;
}
var CanvasTileLayerRenderer = class extends Layer_default {
  /**
   * @param {LayerType} tileLayer Tile layer.
   * @param {Options} [options] Options.
   */
  constructor(tileLayer, options) {
    super(tileLayer);
    options = options || {};
    this.extentChanged = true;
    this.renderComplete = false;
    this.renderedExtent_ = null;
    this.renderedPixelRatio;
    this.renderedProjection = null;
    this.renderedRevision;
    this.renderedTiles = [];
    this.renderedSourceKey_;
    this.renderedSourceRevision_;
    this.tempExtent = createEmpty();
    this.tempTileRange_ = new TileRange_default(0, 0, 0, 0);
    this.tempTileCoord_ = createOrUpdate(0, 0, 0);
    const cacheSize = options.cacheSize !== void 0 ? options.cacheSize : 512;
    this.tileCache_ = new LRUCache_default(cacheSize);
    this.maxStaleKeys = cacheSize * 0.5;
  }
  /**
   * @return {LRUCache} Tile cache.
   */
  getTileCache() {
    return this.tileCache_;
  }
  /**
   * Get a tile from the cache or create one if needed.
   *
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {import("../../Tile.js").default|null} Tile (or null if outside source extent).
   * @protected
   */
  getOrCreateTile(z, x, y, frameState) {
    const tileCache = this.tileCache_;
    const tileLayer = this.getLayer();
    const tileSource = tileLayer.getSource();
    const cacheKey = getCacheKey(tileSource.getKey(), z, x, y);
    let tile;
    if (tileCache.containsKey(cacheKey)) {
      tile = tileCache.get(cacheKey);
    } else {
      tile = tileSource.getTile(z, x, y, frameState.pixelRatio, frameState.viewState.projection);
      if (!tile) {
        return null;
      }
      tileCache.set(cacheKey, tile);
    }
    return tile;
  }
  /**
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {import("../../Tile.js").default|null} Tile (or null if outside source extent).
   * @protected
   */
  getTile(z, x, y, frameState) {
    const tile = this.getOrCreateTile(z, x, y, frameState);
    if (!tile) {
      return null;
    }
    return tile;
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
    const viewState = frameState.viewState;
    const source = layer.getRenderSource();
    const tileGrid = source.getTileGridForProjection(viewState.projection);
    const tilePixelRatio = source.getTilePixelRatio(frameState.pixelRatio);
    for (let z = tileGrid.getZForResolution(viewState.resolution); z >= tileGrid.getMinZoom(); --z) {
      const tileCoord = tileGrid.getTileCoordForCoordAndZ(coordinate, z);
      const tile = this.getTile(z, tileCoord[1], tileCoord[2], frameState);
      if (!tile || tile.getState() !== TileState_default.LOADED) {
        continue;
      }
      const tileOrigin = tileGrid.getOrigin(z);
      const tileSize = toSize(tileGrid.getTileSize(z));
      const tileResolution = tileGrid.getResolution(z);
      let image;
      if (tile instanceof ImageTile_default || tile instanceof Tile_default) {
        image = tile.getImage();
      } else if (tile instanceof DataTile_default) {
        image = asImageLike(tile.getData());
        if (!image) {
          continue;
        }
      } else {
        continue;
      }
      const col = Math.floor(tilePixelRatio * ((coordinate[0] - tileOrigin[0]) / tileResolution - tileCoord[1] * tileSize[0]));
      const row = Math.floor(tilePixelRatio * ((tileOrigin[1] - coordinate[1]) / tileResolution - tileCoord[2] * tileSize[1]));
      const gutter = Math.round(tilePixelRatio * source.getGutterForProjection(viewState.projection));
      return this.getImageData(image, col + gutter, row + gutter);
    }
    return null;
  }
  /**
   * Determine whether render should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   * @override
   */
  prepareFrame(frameState) {
    if (!this.renderedProjection) {
      this.renderedProjection = frameState.viewState.projection;
    } else if (frameState.viewState.projection !== this.renderedProjection) {
      this.tileCache_.clear();
      this.renderedProjection = frameState.viewState.projection;
    }
    const source = this.getLayer().getSource();
    if (!source) {
      return false;
    }
    const sourceRevision = source.getRevision();
    if (!this.renderedRevision_) {
      this.renderedRevision_ = sourceRevision;
    } else if (this.renderedRevision_ !== sourceRevision) {
      this.renderedRevision_ = sourceRevision;
      if (this.renderedSourceKey_ === source.getKey()) {
        this.tileCache_.clear();
      }
    }
    return true;
  }
  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {import("../../extent.js").Extent} extent The extent to be rendered.
   * @param {number} initialZ The zoom level.
   * @param {TileLookup} tilesByZ Lookup of tiles by zoom level.
   * @param {number} preload Number of additional levels to load.
   */
  enqueueTiles(frameState, extent, initialZ, tilesByZ, preload) {
    const viewState = frameState.viewState;
    const tileLayer = this.getLayer();
    const tileSource = tileLayer.getRenderSource();
    const tileGrid = tileSource.getTileGridForProjection(viewState.projection);
    const tileSourceKey = getUid(tileSource);
    if (!(tileSourceKey in frameState.wantedTiles)) {
      frameState.wantedTiles[tileSourceKey] = {};
    }
    const wantedTiles = frameState.wantedTiles[tileSourceKey];
    const map = tileLayer.getMapInternal();
    const minZ = Math.max(initialZ - preload, tileGrid.getMinZoom(), tileGrid.getZForResolution(Math.min(tileLayer.getMaxResolution(), map ? map.getView().getResolutionForZoom(Math.max(tileLayer.getMinZoom(), 0)) : tileGrid.getResolution(0)), tileSource.zDirection));
    for (let z = initialZ; z >= minZ; --z) {
      const tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z, this.tempTileRange_);
      const tileResolution = tileGrid.getResolution(z);
      for (let x = tileRange.minX; x <= tileRange.maxX; ++x) {
        for (let y = tileRange.minY; y <= tileRange.maxY; ++y) {
          const tile = this.getTile(z, x, y, frameState);
          if (!tile) {
            continue;
          }
          const added = addTileToLookup(tilesByZ, tile, z);
          if (!added) {
            continue;
          }
          const tileQueueKey = tile.getKey();
          wantedTiles[tileQueueKey] = true;
          if (tile.getState() === TileState_default.IDLE) {
            if (!frameState.tileQueue.isKeyQueued(tileQueueKey)) {
              const tileCoord = createOrUpdate(z, x, y, this.tempTileCoord_);
              frameState.tileQueue.enqueue([tile, tileSourceKey, tileGrid.getTileCoordCenter(tileCoord), tileResolution]);
            }
          }
        }
      }
    }
  }
  /**
   * Look for tiles covering the provided tile coordinate at an alternate
   * zoom level.  Loaded tiles will be added to the provided tile texture lookup.
   * @param {import("../../tilecoord.js").TileCoord} tileCoord The target tile coordinate.
   * @param {TileLookup} tilesByZ Lookup of tiles by zoom level.
   * @return {boolean} The tile coordinate is covered by loaded tiles at the alternate zoom level.
   * @private
   */
  findStaleTile_(tileCoord, tilesByZ) {
    const tileCache = this.tileCache_;
    const z = tileCoord[0];
    const x = tileCoord[1];
    const y = tileCoord[2];
    const staleKeys = this.getStaleKeys();
    for (let i = 0; i < staleKeys.length; ++i) {
      const cacheKey = getCacheKey(staleKeys[i], z, x, y);
      if (tileCache.containsKey(cacheKey)) {
        const tile = tileCache.get(cacheKey);
        if (tile.getState() === TileState_default.LOADED) {
          tile.endTransition(getUid(this));
          addTileToLookup(tilesByZ, tile, z);
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Look for tiles covering the provided tile coordinate at an alternate
   * zoom level.  Loaded tiles will be added to the provided tile texture lookup.
   * @param {import("../../tilegrid/TileGrid.js").default} tileGrid The tile grid.
   * @param {import("../../tilecoord.js").TileCoord} tileCoord The target tile coordinate.
   * @param {number} altZ The alternate zoom level.
   * @param {TileLookup} tilesByZ Lookup of tiles by zoom level.
   * @return {boolean} The tile coordinate is covered by loaded tiles at the alternate zoom level.
   * @private
   */
  findAltTiles_(tileGrid, tileCoord, altZ, tilesByZ) {
    const tileRange = tileGrid.getTileRangeForTileCoordAndZ(tileCoord, altZ, this.tempTileRange_);
    if (!tileRange) {
      return false;
    }
    let covered = true;
    const tileCache = this.tileCache_;
    const source = this.getLayer().getRenderSource();
    const sourceKey = source.getKey();
    for (let x = tileRange.minX; x <= tileRange.maxX; ++x) {
      for (let y = tileRange.minY; y <= tileRange.maxY; ++y) {
        const cacheKey = getCacheKey(sourceKey, altZ, x, y);
        let loaded = false;
        if (tileCache.containsKey(cacheKey)) {
          const tile = tileCache.get(cacheKey);
          if (tile.getState() === TileState_default.LOADED) {
            addTileToLookup(tilesByZ, tile, altZ);
            loaded = true;
          }
        }
        if (!loaded) {
          covered = false;
        }
      }
    }
    return covered;
  }
  /**
   * Render the layer.
   *
   * The frame rendering logic has three parts:
   *
   *  1. Enqueue tiles
   *  2. Find alt tiles for those that are not yet loaded
   *  3. Render loaded tiles
   *
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {HTMLElement} target Target that may be used to render content to.
   * @return {HTMLElement} The rendered element.
   * @override
   */
  renderFrame(frameState, target) {
    let allTilesIdle = true;
    this.renderComplete = true;
    const layerState = frameState.layerStatesArray[frameState.layerIndex];
    const viewState = frameState.viewState;
    const projection = viewState.projection;
    const viewResolution = viewState.resolution;
    const viewCenter = viewState.center;
    const pixelRatio = frameState.pixelRatio;
    const tileLayer = this.getLayer();
    const tileSource = tileLayer.getSource();
    const sourceRevision = tileSource.getRevision();
    const tileGrid = tileSource.getTileGridForProjection(projection);
    const z = tileGrid.getZForResolution(viewResolution, tileSource.zDirection);
    const tileResolution = tileGrid.getResolution(z);
    const sourceKey = tileSource.getKey();
    if (!this.renderedSourceKey_) {
      this.renderedSourceKey_ = sourceKey;
    } else if (this.renderedSourceKey_ !== sourceKey) {
      this.prependStaleKey(this.renderedSourceKey_);
      this.renderedSourceKey_ = sourceKey;
    }
    let frameExtent = frameState.extent;
    const tilePixelRatio = tileSource.getTilePixelRatio(pixelRatio);
    this.prepareContainer(frameState, target);
    const width = this.context.canvas.width;
    const height = this.context.canvas.height;
    const layerExtent = layerState.extent && fromUserExtent(layerState.extent, projection);
    if (layerExtent) {
      frameExtent = getIntersection(frameExtent, fromUserExtent(layerState.extent, projection));
    }
    const dx = tileResolution * width / 2 / tilePixelRatio;
    const dy = tileResolution * height / 2 / tilePixelRatio;
    const canvasExtent = [viewCenter[0] - dx, viewCenter[1] - dy, viewCenter[0] + dx, viewCenter[1] + dy];
    const tilesByZ = {};
    this.renderedTiles.length = 0;
    const preload = tileLayer.getPreload();
    if (frameState.nextExtent) {
      const targetZ = tileGrid.getZForResolution(viewState.nextResolution, tileSource.zDirection);
      const nextExtent = getRenderExtent(frameState, frameState.nextExtent);
      this.enqueueTiles(frameState, nextExtent, targetZ, tilesByZ, preload);
    }
    const renderExtent = getRenderExtent(frameState, frameExtent);
    this.enqueueTiles(frameState, renderExtent, z, tilesByZ, 0);
    if (preload > 0) {
      setTimeout(() => {
        this.enqueueTiles(frameState, renderExtent, z - 1, tilesByZ, preload - 1);
      }, 0);
    }
    if (!(z in tilesByZ)) {
      return this.container;
    }
    const uid = getUid(this);
    const time = frameState.time;
    for (const tile of tilesByZ[z]) {
      const tileState = tile.getState();
      if ((tile instanceof Tile_default || tile instanceof DataTile_default2) && tileState === TileState_default.EMPTY) {
        continue;
      }
      const tileCoord = tile.tileCoord;
      if (tileState === TileState_default.LOADED) {
        const alpha = tile.getAlpha(uid, time);
        if (alpha === 1) {
          tile.endTransition(uid);
          continue;
        }
      }
      if (tileState !== TileState_default.IDLE) {
        allTilesIdle = false;
      }
      if (tileState !== TileState_default.ERROR) {
        this.renderComplete = false;
      }
      const hasStaleTile = this.findStaleTile_(tileCoord, tilesByZ);
      if (hasStaleTile) {
        removeTileFromLookup(tilesByZ, tile, z);
        frameState.animate = true;
        continue;
      }
      const coveredByChildren = this.findAltTiles_(tileGrid, tileCoord, z + 1, tilesByZ);
      if (coveredByChildren) {
        continue;
      }
      const minZoom = tileGrid.getMinZoom();
      for (let parentZ = z - 1; parentZ >= minZoom; --parentZ) {
        const coveredByParent = this.findAltTiles_(tileGrid, tileCoord, parentZ, tilesByZ);
        if (coveredByParent) {
          break;
        }
      }
    }
    const canvasScale = tileResolution / viewResolution * pixelRatio / tilePixelRatio;
    const context = this.getRenderContext(frameState);
    compose(this.tempTransform, width / 2, height / 2, canvasScale, canvasScale, 0, -width / 2, -height / 2);
    if (layerState.extent) {
      this.clipUnrotated(context, frameState, layerExtent);
    }
    if (!tileSource.getInterpolate()) {
      context.imageSmoothingEnabled = false;
    }
    this.preRender(context, frameState);
    const zs = Object.keys(tilesByZ).map(Number);
    zs.sort(ascending);
    let currentClip;
    const clips = [];
    const clipZs = [];
    for (let i = zs.length - 1; i >= 0; --i) {
      const currentZ = zs[i];
      const currentTilePixelSize = tileSource.getTilePixelSize(currentZ, pixelRatio, projection);
      const currentResolution = tileGrid.getResolution(currentZ);
      const currentScale = currentResolution / tileResolution;
      const dx2 = currentTilePixelSize[0] * currentScale * canvasScale;
      const dy2 = currentTilePixelSize[1] * currentScale * canvasScale;
      const originTileCoord = tileGrid.getTileCoordForCoordAndZ(getTopLeft(canvasExtent), currentZ);
      const originTileExtent = tileGrid.getTileCoordExtent(originTileCoord);
      const origin = apply(this.tempTransform, [tilePixelRatio * (originTileExtent[0] - canvasExtent[0]) / tileResolution, tilePixelRatio * (canvasExtent[3] - originTileExtent[3]) / tileResolution]);
      const tileGutter = tilePixelRatio * tileSource.getGutterForProjection(projection);
      for (const tile of tilesByZ[currentZ]) {
        if (tile.getState() !== TileState_default.LOADED) {
          continue;
        }
        const tileCoord = tile.tileCoord;
        const xIndex = originTileCoord[1] - tileCoord[1];
        const nextX = Math.round(origin[0] - (xIndex - 1) * dx2);
        const yIndex = originTileCoord[2] - tileCoord[2];
        const nextY = Math.round(origin[1] - (yIndex - 1) * dy2);
        const x = Math.round(origin[0] - xIndex * dx2);
        const y = Math.round(origin[1] - yIndex * dy2);
        const w = nextX - x;
        const h = nextY - y;
        const transition = zs.length === 1;
        let contextSaved = false;
        currentClip = [x, y, x + w, y, x + w, y + h, x, y + h];
        for (let i2 = 0, ii = clips.length; i2 < ii; ++i2) {
          if (!transition && currentZ < clipZs[i2]) {
            const clip = clips[i2];
            if (intersects([x, y, x + w, y + h], [clip[0], clip[3], clip[4], clip[7]])) {
              if (!contextSaved) {
                context.save();
                contextSaved = true;
              }
              context.beginPath();
              context.moveTo(currentClip[0], currentClip[1]);
              context.lineTo(currentClip[2], currentClip[3]);
              context.lineTo(currentClip[4], currentClip[5]);
              context.lineTo(currentClip[6], currentClip[7]);
              context.moveTo(clip[6], clip[7]);
              context.lineTo(clip[4], clip[5]);
              context.lineTo(clip[2], clip[3]);
              context.lineTo(clip[0], clip[1]);
              context.clip();
            }
          }
        }
        clips.push(currentClip);
        clipZs.push(currentZ);
        this.drawTile(tile, frameState, x, y, w, h, tileGutter, transition);
        if (contextSaved) {
          context.restore();
        }
        this.renderedTiles.unshift(tile);
        this.updateUsedTiles(frameState.usedTiles, tileSource, tile);
      }
    }
    this.renderedRevision = sourceRevision;
    this.renderedResolution = tileResolution;
    this.extentChanged = !this.renderedExtent_ || !equals(this.renderedExtent_, canvasExtent);
    this.renderedExtent_ = canvasExtent;
    this.renderedPixelRatio = pixelRatio;
    this.postRender(this.context, frameState);
    if (layerState.extent) {
      context.restore();
    }
    context.imageSmoothingEnabled = true;
    if (this.renderComplete) {
      const postRenderFunction = (map, frameState2) => {
        const tileSourceKey = getUid(tileSource);
        const wantedTiles = frameState2.wantedTiles[tileSourceKey];
        const tilesCount = wantedTiles ? Object.keys(wantedTiles).length : 0;
        this.updateCacheSize(tilesCount);
        this.tileCache_.expireCache();
      };
      frameState.postRenderFunctions.push(postRenderFunction);
    }
    if (!this.renderComplete && !allTilesIdle) {
      frameState.animate = true;
    }
    return this.container;
  }
  /**
   * Increases the cache size if needed
   * @param {number} tileCount Minimum number of tiles needed.
   */
  updateCacheSize(tileCount) {
    this.tileCache_.highWaterMark = Math.max(this.tileCache_.highWaterMark, tileCount * 2);
  }
  /**
   * @param {import("../../Tile.js").default} tile Tile.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {number} x Left of the tile.
   * @param {number} y Top of the tile.
   * @param {number} w Width of the tile.
   * @param {number} h Height of the tile.
   * @param {number} gutter Tile gutter.
   * @param {boolean} transition Apply an alpha transition.
   * @protected
   */
  drawTile(tile, frameState, x, y, w, h, gutter, transition) {
    let image;
    if (tile instanceof DataTile_default) {
      image = asImageLike(tile.getData());
      if (!image) {
        throw new Error("Rendering array data is not yet supported");
      }
    } else {
      image = this.getTileImage(
        /** @type {import("../../ImageTile.js").default} */
        tile
      );
    }
    if (!image) {
      return;
    }
    const context = this.getRenderContext(frameState);
    const uid = getUid(this);
    const layerState = frameState.layerStatesArray[frameState.layerIndex];
    const alpha = layerState.opacity * (transition ? tile.getAlpha(uid, frameState.time) : 1);
    const alphaChanged = alpha !== context.globalAlpha;
    if (alphaChanged) {
      context.save();
      context.globalAlpha = alpha;
    }
    context.drawImage(image, gutter, gutter, image.width - 2 * gutter, image.height - 2 * gutter, x, y, w, h);
    if (alphaChanged) {
      context.restore();
    }
    if (alpha !== layerState.opacity) {
      frameState.animate = true;
    } else if (transition) {
      tile.endTransition(uid);
    }
  }
  /**
   * @return {HTMLCanvasElement} Image
   */
  getImage() {
    const context = this.context;
    return context ? context.canvas : null;
  }
  /**
   * Get the image from a tile.
   * @param {import("../../ImageTile.js").default} tile Tile.
   * @return {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} Image.
   * @protected
   */
  getTileImage(tile) {
    return tile.getImage();
  }
  /**
   * @param {!Object<string, !Object<string, boolean>>} usedTiles Used tiles.
   * @param {import("../../source/Tile.js").default} tileSource Tile source.
   * @param {import('../../Tile.js').default} tile Tile.
   * @protected
   */
  updateUsedTiles(usedTiles, tileSource, tile) {
    const tileSourceKey = getUid(tileSource);
    if (!(tileSourceKey in usedTiles)) {
      usedTiles[tileSourceKey] = {};
    }
    usedTiles[tileSourceKey][tile.getKey()] = true;
  }
};
var TileLayer_default = CanvasTileLayerRenderer;

export {
  TileLayer_default
};
//# sourceMappingURL=chunk-Y22DGWX5.js.map
