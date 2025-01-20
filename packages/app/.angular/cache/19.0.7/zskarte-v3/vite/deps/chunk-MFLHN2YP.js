import {
  UrlTile_default
} from "./chunk-45BLP2OC.js";
import {
  createXYZ,
  extentFromProjection
} from "./chunk-Z7PA7HSF.js";
import {
  TileGrid_default
} from "./chunk-TLKYGVK5.js";
import {
  VectorRenderTile_default,
  VectorTile_default
} from "./chunk-UQ5VBCTK.js";
import {
  TileState_default
} from "./chunk-WFUVBADM.js";
import {
  loadFeaturesXhr
} from "./chunk-37JEKLY7.js";
import {
  toSize
} from "./chunk-EA4JZPIY.js";
import {
  DEFAULT_MAX_ZOOM
} from "./chunk-FJKL6GEV.js";
import {
  buffer,
  getIntersection,
  intersects
} from "./chunk-IHYRLUFT.js";
import {
  EventType_default
} from "./chunk-X7DDFSZC.js";
import {
  isEmpty
} from "./chunk-MEYD4SA6.js";

// ../../node_modules/ol/source/VectorTile.js
var VectorTile = class extends UrlTile_default {
  /**
   * @param {!Options<FeatureType>} options Vector tile options.
   */
  constructor(options) {
    const projection = options.projection || "EPSG:3857";
    const extent = options.extent || extentFromProjection(projection);
    const tileGrid = options.tileGrid || createXYZ({
      extent,
      maxResolution: options.maxResolution,
      maxZoom: options.maxZoom !== void 0 ? options.maxZoom : 22,
      minZoom: options.minZoom,
      tileSize: options.tileSize || 512
    });
    super({
      attributions: options.attributions,
      attributionsCollapsible: options.attributionsCollapsible,
      cacheSize: options.cacheSize,
      interpolate: true,
      projection,
      state: options.state,
      tileGrid,
      tileLoadFunction: options.tileLoadFunction ? options.tileLoadFunction : defaultLoadFunction,
      tileUrlFunction: options.tileUrlFunction,
      url: options.url,
      urls: options.urls,
      wrapX: options.wrapX === void 0 ? true : options.wrapX,
      transition: options.transition,
      zDirection: options.zDirection === void 0 ? 1 : options.zDirection
    });
    this.format_ = options.format ? options.format : null;
    this.tileKeysBySourceTileUrl_ = {};
    this.sourceTiles_ = {};
    this.overlaps_ = options.overlaps == void 0 ? true : options.overlaps;
    this.tileClass = options.tileClass ? options.tileClass : VectorTile_default;
    this.tileGrids_ = {};
  }
  /**
   * @return {boolean} The source can have overlapping geometries.
   */
  getOverlaps() {
    return this.overlaps_;
  }
  /**
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection").default} projection Projection.
   * @param {VectorRenderTile} tile Vector render tile.
   * @return {Array<import("../VectorTile").default>} Tile keys.
   */
  getSourceTiles(pixelRatio, projection, tile) {
    if (tile.getState() === TileState_default.IDLE) {
      tile.setState(TileState_default.LOADING);
      const urlTileCoord = tile.wrappedTileCoord;
      const tileGrid = this.getTileGridForProjection(projection);
      const extent = tileGrid.getTileCoordExtent(urlTileCoord);
      const z = urlTileCoord[0];
      const resolution = tileGrid.getResolution(z);
      buffer(extent, -resolution, extent);
      const sourceTileGrid = this.tileGrid;
      const sourceExtent = sourceTileGrid.getExtent();
      if (sourceExtent) {
        getIntersection(extent, sourceExtent, extent);
      }
      const sourceZ = sourceTileGrid.getZForResolution(resolution, this.zDirection);
      sourceTileGrid.forEachTileCoord(extent, sourceZ, (sourceTileCoord) => {
        const tileUrl = this.tileUrlFunction(sourceTileCoord, pixelRatio, projection);
        if (!this.sourceTiles_[tileUrl]) {
          this.sourceTiles_[tileUrl] = new this.tileClass(sourceTileCoord, tileUrl ? TileState_default.IDLE : TileState_default.EMPTY, tileUrl, this.format_, this.tileLoadFunction);
        }
        const sourceTile = this.sourceTiles_[tileUrl];
        tile.sourceTiles.push(sourceTile);
        if (!this.tileKeysBySourceTileUrl_[tileUrl]) {
          this.tileKeysBySourceTileUrl_[tileUrl] = [];
        }
        this.tileKeysBySourceTileUrl_[tileUrl].push(tile.getKey());
        const sourceTileState = sourceTile.getState();
        if (sourceTileState < TileState_default.LOADED) {
          const listenChange = (event) => {
            this.handleTileChange(event);
            const state = sourceTile.getState();
            if (state === TileState_default.LOADED || state === TileState_default.ERROR) {
              const sourceTileKey = sourceTile.getKey();
              if (sourceTileKey in tile.errorTileKeys) {
                if (sourceTile.getState() === TileState_default.LOADED) {
                  delete tile.errorTileKeys[sourceTileKey];
                }
              } else {
                tile.loadingSourceTiles--;
              }
              if (state === TileState_default.ERROR) {
                tile.errorTileKeys[sourceTileKey] = true;
              } else {
                sourceTile.removeEventListener(EventType_default.CHANGE, listenChange);
              }
              if (tile.loadingSourceTiles === 0) {
                tile.setState(isEmpty(tile.errorTileKeys) ? TileState_default.LOADED : TileState_default.ERROR);
              }
            }
          };
          sourceTile.addEventListener(EventType_default.CHANGE, listenChange);
          tile.loadingSourceTiles++;
        }
        if (sourceTileState === TileState_default.IDLE) {
          sourceTile.extent = sourceTileGrid.getTileCoordExtent(sourceTileCoord);
          sourceTile.projection = projection;
          sourceTile.resolution = sourceTileGrid.getResolution(sourceTileCoord[0]);
          sourceTile.load();
        }
      });
      if (!tile.loadingSourceTiles) {
        tile.setState(tile.sourceTiles.some((sourceTile) => sourceTile.getState() === TileState_default.ERROR) ? TileState_default.ERROR : TileState_default.LOADED);
      }
    }
    return tile.sourceTiles;
  }
  /**
   * @param {VectorRenderTile} tile Vector render tile.
   */
  removeSourceTiles(tile) {
    const sourceTiles = tile.sourceTiles;
    for (let i = 0, ii = sourceTiles.length; i < ii; ++i) {
      const sourceTileUrl = sourceTiles[i].getTileUrl();
      const tileKey = this.getKey();
      if (!this.tileKeysBySourceTileUrl_[sourceTileUrl]) {
        return;
      }
      const index = this.tileKeysBySourceTileUrl_[sourceTileUrl][tileKey];
      if (index === -1) {
        continue;
      }
      this.tileKeysBySourceTileUrl_[sourceTileUrl].splice(index, 1);
      if (this.tileKeysBySourceTileUrl_[sourceTileUrl].length === 0) {
        delete this.tileKeysBySourceTileUrl_[sourceTileUrl];
        delete this.sourceTiles_[sourceTileUrl];
      }
    }
  }
  /**
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {!VectorRenderTile} Tile.
   * @override
   */
  getTile(z, x, y, pixelRatio, projection) {
    const tileCoord = [z, x, y];
    let urlTileCoord = this.getTileCoordForTileUrlFunction(tileCoord, projection);
    const sourceExtent = this.getTileGrid().getExtent();
    const tileGrid = this.getTileGridForProjection(projection);
    if (urlTileCoord && sourceExtent) {
      const tileExtent = tileGrid.getTileCoordExtent(urlTileCoord);
      buffer(tileExtent, -tileGrid.getResolution(z), tileExtent);
      if (!intersects(sourceExtent, tileExtent)) {
        urlTileCoord = null;
      }
    }
    let empty = true;
    if (urlTileCoord !== null) {
      const sourceTileGrid = this.tileGrid;
      const resolution = tileGrid.getResolution(z);
      const sourceZ = sourceTileGrid.getZForResolution(resolution, 1);
      const extent = tileGrid.getTileCoordExtent(urlTileCoord);
      buffer(extent, -resolution, extent);
      sourceTileGrid.forEachTileCoord(extent, sourceZ, (sourceTileCoord) => {
        empty = empty && !this.tileUrlFunction(sourceTileCoord, pixelRatio, projection);
      });
    }
    const newTile = new VectorRenderTile_default(tileCoord, empty ? TileState_default.EMPTY : TileState_default.IDLE, urlTileCoord, this.getSourceTiles.bind(this, pixelRatio, projection), this.removeSourceTiles.bind(this));
    newTile.key = this.getKey();
    return newTile;
  }
  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {!import("../tilegrid/TileGrid.js").default} Tile grid.
   * @override
   */
  getTileGridForProjection(projection) {
    const code = projection.getCode();
    let tileGrid = this.tileGrids_[code];
    if (!tileGrid) {
      const sourceTileGrid = this.tileGrid;
      const resolutions = sourceTileGrid.getResolutions().slice();
      const origins = resolutions.map(function(resolution, z) {
        return sourceTileGrid.getOrigin(z);
      });
      const tileSizes = resolutions.map(function(resolution, z) {
        return sourceTileGrid.getTileSize(z);
      });
      const length = DEFAULT_MAX_ZOOM + 1;
      for (let z = resolutions.length; z < length; ++z) {
        resolutions.push(resolutions[z - 1] / 2);
        origins.push(origins[z - 1]);
        tileSizes.push(tileSizes[z - 1]);
      }
      tileGrid = new TileGrid_default({
        extent: sourceTileGrid.getExtent(),
        origins,
        resolutions,
        tileSizes
      });
      this.tileGrids_[code] = tileGrid;
    }
    return tileGrid;
  }
  /**
   * Get the tile pixel ratio for this source.
   * @param {number} pixelRatio Pixel ratio.
   * @return {number} Tile pixel ratio.
   * @override
   */
  getTilePixelRatio(pixelRatio) {
    return pixelRatio;
  }
  /**
   * @param {number} z Z.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {import("../size.js").Size} Tile size.
   * @override
   */
  getTilePixelSize(z, pixelRatio, projection) {
    const tileGrid = this.getTileGridForProjection(projection);
    const tileSize = toSize(tileGrid.getTileSize(z), this.tmpSize);
    return [Math.round(tileSize[0] * pixelRatio), Math.round(tileSize[1] * pixelRatio)];
  }
  /**
   * @param {boolean} overlaps The source has overlapping geometries.
   */
  setOverlaps(overlaps) {
    this.overlaps_ = overlaps;
    this.changed();
  }
};
var VectorTile_default2 = VectorTile;
function defaultLoadFunction(tile, url) {
  tile.setLoader(
    /**
     * @param {import("../extent.js").Extent} extent Extent.
     * @param {number} resolution Resolution.
     * @param {import("../proj/Projection.js").default} projection Projection.
     */
    function(extent, resolution, projection) {
      loadFeaturesXhr(url, tile.getFormat(), extent, resolution, projection, tile.onLoad.bind(tile), tile.onError.bind(tile));
    }
  );
}

export {
  VectorTile_default2 as VectorTile_default,
  defaultLoadFunction
};
//# sourceMappingURL=chunk-MFLHN2YP.js.map
