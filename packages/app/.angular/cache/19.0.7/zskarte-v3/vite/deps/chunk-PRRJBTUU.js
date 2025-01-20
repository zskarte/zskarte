import {
  TileEventType_default,
  TileSourceEvent,
  Tile_default
} from "./chunk-45BLP2OC.js";
import {
  createXYZ,
  extentFromProjection,
  getForProjection
} from "./chunk-Z7PA7HSF.js";
import {
  DataTile_default,
  DataTile_default2
} from "./chunk-PMSTMQL3.js";
import {
  TileState_default
} from "./chunk-WFUVBADM.js";
import {
  toSize
} from "./chunk-EA4JZPIY.js";
import {
  equivalent,
  get3 as get
} from "./chunk-QPOUXWMH.js";
import {
  EventType_default,
  toPromise
} from "./chunk-X7DDFSZC.js";
import {
  getUid
} from "./chunk-JL7CNLN5.js";

// ../../node_modules/ol/source/DataTile.js
var DataTileSource = class extends Tile_default {
  /**
   * @param {Options} options DataTile source options.
   */
  constructor(options) {
    const projection = options.projection === void 0 ? "EPSG:3857" : options.projection;
    let tileGrid = options.tileGrid;
    if (tileGrid === void 0 && projection) {
      tileGrid = createXYZ({
        extent: extentFromProjection(projection),
        maxResolution: options.maxResolution,
        maxZoom: options.maxZoom,
        minZoom: options.minZoom,
        tileSize: options.tileSize
      });
    }
    super({
      cacheSize: 0.1,
      // don't cache on the source
      attributions: options.attributions,
      attributionsCollapsible: options.attributionsCollapsible,
      projection,
      tileGrid,
      state: options.state,
      wrapX: options.wrapX,
      transition: options.transition,
      interpolate: options.interpolate,
      key: options.key,
      zDirection: options.zDirection
    });
    this.gutter_ = options.gutter !== void 0 ? options.gutter : 0;
    this.tileSize_ = options.tileSize ? toSize(options.tileSize) : null;
    this.tileSizes_ = null;
    this.tileLoadingKeys_ = {};
    this.loader_ = options.loader;
    this.handleTileChange_ = this.handleTileChange_.bind(this);
    this.bandCount = options.bandCount === void 0 ? 4 : options.bandCount;
    this.tileGridForProjection_ = {};
    this.crossOrigin_ = options.crossOrigin || "anonymous";
    this.transformMatrix = null;
  }
  /**
   * Set the source tile sizes.  The length of the array is expected to match the number of
   * levels in the tile grid.
   * @protected
   * @param {Array<import('../size.js').Size>} tileSizes An array of tile sizes.
   */
  setTileSizes(tileSizes) {
    this.tileSizes_ = tileSizes;
  }
  /**
   * Get the source tile size at the given zoom level.  This may be different than the rendered tile
   * size.
   * @protected
   * @param {number} z Tile zoom level.
   * @return {import('../size.js').Size} The source tile size.
   */
  getTileSize(z) {
    if (this.tileSizes_) {
      return this.tileSizes_[z];
    }
    if (this.tileSize_) {
      return this.tileSize_;
    }
    const tileGrid = this.getTileGrid();
    return tileGrid ? toSize(tileGrid.getTileSize(z)) : [256, 256];
  }
  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {number} Gutter.
   * @override
   */
  getGutterForProjection(projection) {
    const thisProj = this.getProjection();
    if ((!thisProj || equivalent(thisProj, projection)) && !this.transformMatrix) {
      return this.gutter_;
    }
    return 0;
  }
  /**
   * @param {Loader} loader The data loader.
   * @protected
   */
  setLoader(loader) {
    this.loader_ = loader;
  }
  /**
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {import("../proj/Projection.js").default} targetProj The output projection.
   * @param {import("../proj/Projection.js").default} sourceProj The input projection.
   * @return {!TileType} Tile.
   */
  getReprojTile_(z, x, y, targetProj, sourceProj) {
    const sourceTileGrid = this.tileGrid || this.getTileGridForProjection(sourceProj || targetProj);
    const reprojTilePixelRatio = Math.max.apply(null, sourceTileGrid.getResolutions().map((r, z2) => {
      const tileSize = toSize(sourceTileGrid.getTileSize(z2));
      const textureSize = this.getTileSize(z2);
      return Math.max(textureSize[0] / tileSize[0], textureSize[1] / tileSize[1]);
    }));
    const targetTileGrid = this.getTileGridForProjection(targetProj);
    const tileCoord = [z, x, y];
    const wrappedTileCoord = this.getTileCoordForTileUrlFunction(tileCoord, targetProj);
    const options = Object.assign(
      {
        sourceProj: sourceProj || targetProj,
        sourceTileGrid,
        targetProj,
        targetTileGrid,
        tileCoord,
        wrappedTileCoord,
        pixelRatio: reprojTilePixelRatio,
        gutter: this.gutter_,
        getTileFunction: (z2, x2, y2, pixelRatio) => this.getTile(z2, x2, y2, pixelRatio),
        transformMatrix: this.transformMatrix
      },
      /** @type {import("../reproj/DataTile.js").Options} */
      this.tileOptions
    );
    const tile = (
      /** @type {TileType} */
      /** @type {*} */
      new DataTile_default2(options)
    );
    tile.key = this.getKey();
    return tile;
  }
  /**
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} [projection] Projection.
   * @return {TileType|null} Tile (or null if outside source extent).
   * @override
   */
  getTile(z, x, y, pixelRatio, projection) {
    const sourceProjection = this.getProjection();
    if (projection && (sourceProjection && !equivalent(sourceProjection, projection) || this.transformMatrix)) {
      return this.getReprojTile_(z, x, y, projection, sourceProjection);
    }
    const size = this.getTileSize(z);
    const sourceLoader = this.loader_;
    const controller = new AbortController();
    const loaderOptions = {
      signal: controller.signal,
      crossOrigin: this.crossOrigin_
    };
    const tileCoord = this.getTileCoordForTileUrlFunction([z, x, y]);
    if (!tileCoord) {
      return null;
    }
    const requestZ = tileCoord[0];
    const requestX = tileCoord[1];
    const requestY = tileCoord[2];
    const range = this.getTileGrid()?.getFullTileRange(requestZ);
    if (range) {
      loaderOptions.maxY = range.getHeight() - 1;
    }
    function loader() {
      return toPromise(function() {
        return sourceLoader(requestZ, requestX, requestY, loaderOptions);
      });
    }
    const options = Object.assign({
      tileCoord: [z, x, y],
      loader,
      size,
      controller
    }, this.tileOptions);
    const tile = (
      /** @type {TileType} */
      /** @type {*} */
      new DataTile_default(options)
    );
    tile.key = this.getKey();
    tile.addEventListener(EventType_default.CHANGE, this.handleTileChange_);
    return tile;
  }
  /**
   * Handle tile change events.
   * @param {import("../events/Event.js").default} event Event.
   */
  handleTileChange_(event) {
    const tile = (
      /** @type {import("../Tile.js").default} */
      event.target
    );
    const uid = getUid(tile);
    const tileState = tile.getState();
    let type;
    if (tileState == TileState_default.LOADING) {
      this.tileLoadingKeys_[uid] = true;
      type = TileEventType_default.TILELOADSTART;
    } else if (uid in this.tileLoadingKeys_) {
      delete this.tileLoadingKeys_[uid];
      type = tileState == TileState_default.ERROR ? TileEventType_default.TILELOADERROR : tileState == TileState_default.LOADED ? TileEventType_default.TILELOADEND : void 0;
    }
    if (type) {
      this.dispatchEvent(new TileSourceEvent(type, tile));
    }
  }
  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {!import("../tilegrid/TileGrid.js").default} Tile grid.
   * @override
   */
  getTileGridForProjection(projection) {
    const thisProj = this.getProjection();
    if (this.tileGrid && (!thisProj || equivalent(thisProj, projection)) && !this.transformMatrix) {
      return this.tileGrid;
    }
    const projKey = getUid(projection);
    if (!(projKey in this.tileGridForProjection_)) {
      this.tileGridForProjection_[projKey] = getForProjection(projection);
    }
    return this.tileGridForProjection_[projKey];
  }
  /**
   * Sets the tile grid to use when reprojecting the tiles to the given
   * projection instead of the default tile grid for the projection.
   *
   * This can be useful when the default tile grid cannot be created
   * (e.g. projection has no extent defined) or
   * for optimization reasons (custom tile size, resolutions, ...).
   *
   * @param {import("../proj.js").ProjectionLike} projection Projection.
   * @param {import("../tilegrid/TileGrid.js").default} tilegrid Tile grid to use for the projection.
   * @api
   */
  setTileGridForProjection(projection, tilegrid) {
    const proj = get(projection);
    if (proj) {
      const projKey = getUid(proj);
      if (!(projKey in this.tileGridForProjection_)) {
        this.tileGridForProjection_[projKey] = tilegrid;
      }
    }
  }
};
var DataTile_default3 = DataTileSource;

// ../../node_modules/ol/format/IIIFInfo.js
var Versions = {
  VERSION1: "version1",
  VERSION2: "version2",
  VERSION3: "version3"
};
var IIIF_PROFILE_VALUES = {};
IIIF_PROFILE_VALUES[Versions.VERSION1] = {
  "level0": {
    supports: [],
    formats: [],
    qualities: ["native"]
  },
  "level1": {
    supports: ["regionByPx", "sizeByW", "sizeByH", "sizeByPct"],
    formats: ["jpg"],
    qualities: ["native"]
  },
  "level2": {
    supports: ["regionByPx", "regionByPct", "sizeByW", "sizeByH", "sizeByPct", "sizeByConfinedWh", "sizeByWh"],
    formats: ["jpg", "png"],
    qualities: ["native", "color", "grey", "bitonal"]
  }
};
IIIF_PROFILE_VALUES[Versions.VERSION2] = {
  "level0": {
    supports: [],
    formats: ["jpg"],
    qualities: ["default"]
  },
  "level1": {
    supports: ["regionByPx", "sizeByW", "sizeByH", "sizeByPct"],
    formats: ["jpg"],
    qualities: ["default"]
  },
  "level2": {
    supports: ["regionByPx", "regionByPct", "sizeByW", "sizeByH", "sizeByPct", "sizeByConfinedWh", "sizeByDistortedWh", "sizeByWh"],
    formats: ["jpg", "png"],
    qualities: ["default", "bitonal"]
  }
};
IIIF_PROFILE_VALUES[Versions.VERSION3] = {
  "level0": {
    supports: [],
    formats: ["jpg"],
    qualities: ["default"]
  },
  "level1": {
    supports: ["regionByPx", "regionSquare", "sizeByW", "sizeByH", "sizeByWh"],
    formats: ["jpg"],
    qualities: ["default"]
  },
  "level2": {
    supports: ["regionByPx", "regionSquare", "regionByPct", "sizeByW", "sizeByH", "sizeByPct", "sizeByConfinedWh", "sizeByWh"],
    formats: ["jpg", "png"],
    qualities: ["default"]
  }
};
IIIF_PROFILE_VALUES["none"] = {
  "none": {
    supports: [],
    formats: [],
    qualities: []
  }
};
function generateVersion1Options(iiifInfo) {
  let levelProfile = iiifInfo.getComplianceLevelSupportedFeatures();
  if (levelProfile === void 0) {
    levelProfile = IIIF_PROFILE_VALUES[Versions.VERSION1]["level0"];
  }
  return {
    url: iiifInfo.imageInfo["@id"] === void 0 ? void 0 : iiifInfo.imageInfo["@id"].replace(/\/?(?:info\.json)?$/g, ""),
    supports: levelProfile.supports,
    formats: [...levelProfile.formats, iiifInfo.imageInfo.formats === void 0 ? [] : iiifInfo.imageInfo.formats],
    qualities: [...levelProfile.qualities, iiifInfo.imageInfo.qualities === void 0 ? [] : iiifInfo.imageInfo.qualities],
    resolutions: iiifInfo.imageInfo.scale_factors,
    tileSize: iiifInfo.imageInfo.tile_width !== void 0 ? iiifInfo.imageInfo.tile_height !== void 0 ? [iiifInfo.imageInfo.tile_width, iiifInfo.imageInfo.tile_height] : [iiifInfo.imageInfo.tile_width, iiifInfo.imageInfo.tile_width] : iiifInfo.imageInfo.tile_height != void 0 ? [iiifInfo.imageInfo.tile_height, iiifInfo.imageInfo.tile_height] : void 0
  };
}
function generateVersion2Options(iiifInfo) {
  const levelProfile = iiifInfo.getComplianceLevelSupportedFeatures(), additionalProfile = Array.isArray(iiifInfo.imageInfo.profile) && iiifInfo.imageInfo.profile.length > 1, profileSupports = additionalProfile && iiifInfo.imageInfo.profile[1].supports ? iiifInfo.imageInfo.profile[1].supports : [], profileFormats = additionalProfile && iiifInfo.imageInfo.profile[1].formats ? iiifInfo.imageInfo.profile[1].formats : [], profileQualities = additionalProfile && iiifInfo.imageInfo.profile[1].qualities ? iiifInfo.imageInfo.profile[1].qualities : [];
  return {
    url: iiifInfo.imageInfo["@id"].replace(/\/?(?:info\.json)?$/g, ""),
    sizes: iiifInfo.imageInfo.sizes === void 0 ? void 0 : iiifInfo.imageInfo.sizes.map(function(size) {
      return [size.width, size.height];
    }),
    tileSize: iiifInfo.imageInfo.tiles === void 0 ? void 0 : [iiifInfo.imageInfo.tiles.map(function(tile) {
      return tile.width;
    })[0], iiifInfo.imageInfo.tiles.map(function(tile) {
      return tile.height === void 0 ? tile.width : tile.height;
    })[0]],
    resolutions: iiifInfo.imageInfo.tiles === void 0 ? void 0 : iiifInfo.imageInfo.tiles.map(function(tile) {
      return tile.scaleFactors;
    })[0],
    supports: [...levelProfile.supports, ...profileSupports],
    formats: [...levelProfile.formats, ...profileFormats],
    qualities: [...levelProfile.qualities, ...profileQualities]
  };
}
function generateVersion3Options(iiifInfo) {
  const levelProfile = iiifInfo.getComplianceLevelSupportedFeatures(), formats = iiifInfo.imageInfo.extraFormats === void 0 ? levelProfile.formats : [...levelProfile.formats, ...iiifInfo.imageInfo.extraFormats], preferredFormat = iiifInfo.imageInfo.preferredFormats !== void 0 && Array.isArray(iiifInfo.imageInfo.preferredFormats) && iiifInfo.imageInfo.preferredFormats.length > 0 ? iiifInfo.imageInfo.preferredFormats.filter(function(format) {
    return ["jpg", "png", "gif"].includes(format);
  }).reduce(function(acc, format) {
    return acc === void 0 && formats.includes(format) ? format : acc;
  }, void 0) : void 0;
  return {
    url: iiifInfo.imageInfo["id"],
    sizes: iiifInfo.imageInfo.sizes === void 0 ? void 0 : iiifInfo.imageInfo.sizes.map(function(size) {
      return [size.width, size.height];
    }),
    tileSize: iiifInfo.imageInfo.tiles === void 0 ? void 0 : [iiifInfo.imageInfo.tiles.map(function(tile) {
      return tile.width;
    })[0], iiifInfo.imageInfo.tiles.map(function(tile) {
      return tile.height;
    })[0]],
    resolutions: iiifInfo.imageInfo.tiles === void 0 ? void 0 : iiifInfo.imageInfo.tiles.map(function(tile) {
      return tile.scaleFactors;
    })[0],
    supports: iiifInfo.imageInfo.extraFeatures === void 0 ? levelProfile.supports : [...levelProfile.supports, ...iiifInfo.imageInfo.extraFeatures],
    formats,
    qualities: iiifInfo.imageInfo.extraQualities === void 0 ? levelProfile.qualities : [...levelProfile.qualities, ...iiifInfo.imageInfo.extraQualities],
    preferredFormat
  };
}
var versionFunctions = {};
versionFunctions[Versions.VERSION1] = generateVersion1Options;
versionFunctions[Versions.VERSION2] = generateVersion2Options;
versionFunctions[Versions.VERSION3] = generateVersion3Options;

export {
  DataTile_default3 as DataTile_default,
  Versions
};
//# sourceMappingURL=chunk-PRRJBTUU.js.map
