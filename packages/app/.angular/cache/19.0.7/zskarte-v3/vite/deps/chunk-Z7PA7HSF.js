import {
  TileGrid_default
} from "./chunk-TLKYGVK5.js";
import {
  toSize
} from "./chunk-EA4JZPIY.js";
import {
  DEFAULT_MAX_ZOOM,
  DEFAULT_TILE_SIZE
} from "./chunk-FJKL6GEV.js";
import {
  METERS_PER_UNIT,
  get3 as get
} from "./chunk-QPOUXWMH.js";
import {
  containsCoordinate,
  createOrUpdate,
  getCorner,
  getHeight,
  getWidth
} from "./chunk-IHYRLUFT.js";

// ../../node_modules/ol/tilegrid.js
function getForProjection(projection) {
  let tileGrid = projection.getDefaultTileGrid();
  if (!tileGrid) {
    tileGrid = createForProjection(projection);
    projection.setDefaultTileGrid(tileGrid);
  }
  return tileGrid;
}
function wrapX(tileGrid, tileCoord, projection) {
  const z = tileCoord[0];
  const center = tileGrid.getTileCoordCenter(tileCoord);
  const projectionExtent = extentFromProjection(projection);
  if (!containsCoordinate(projectionExtent, center)) {
    const worldWidth = getWidth(projectionExtent);
    const worldsAway = Math.ceil((projectionExtent[0] - center[0]) / worldWidth);
    center[0] += worldWidth * worldsAway;
    return tileGrid.getTileCoordForCoordAndZ(center, z);
  }
  return tileCoord;
}
function createForExtent(extent, maxZoom, tileSize, corner) {
  corner = corner !== void 0 ? corner : "top-left";
  const resolutions = resolutionsFromExtent(extent, maxZoom, tileSize);
  return new TileGrid_default({
    extent,
    origin: getCorner(extent, corner),
    resolutions,
    tileSize
  });
}
function createXYZ(options) {
  const xyzOptions = options || {};
  const extent = xyzOptions.extent || get("EPSG:3857").getExtent();
  const gridOptions = {
    extent,
    minZoom: xyzOptions.minZoom,
    tileSize: xyzOptions.tileSize,
    resolutions: resolutionsFromExtent(extent, xyzOptions.maxZoom, xyzOptions.tileSize, xyzOptions.maxResolution)
  };
  return new TileGrid_default(gridOptions);
}
function resolutionsFromExtent(extent, maxZoom, tileSize, maxResolution) {
  maxZoom = maxZoom !== void 0 ? maxZoom : DEFAULT_MAX_ZOOM;
  tileSize = toSize(tileSize !== void 0 ? tileSize : DEFAULT_TILE_SIZE);
  const height = getHeight(extent);
  const width = getWidth(extent);
  maxResolution = maxResolution > 0 ? maxResolution : Math.max(width / tileSize[0], height / tileSize[1]);
  const length = maxZoom + 1;
  const resolutions = new Array(length);
  for (let z = 0; z < length; ++z) {
    resolutions[z] = maxResolution / Math.pow(2, z);
  }
  return resolutions;
}
function createForProjection(projection, maxZoom, tileSize, corner) {
  const extent = extentFromProjection(projection);
  return createForExtent(extent, maxZoom, tileSize, corner);
}
function extentFromProjection(projection) {
  projection = get(projection);
  let extent = projection.getExtent();
  if (!extent) {
    const half = 180 * METERS_PER_UNIT.degrees / projection.getMetersPerUnit();
    extent = createOrUpdate(-half, -half, half, half);
  }
  return extent;
}

export {
  getForProjection,
  wrapX,
  createForExtent,
  createXYZ,
  createForProjection,
  extentFromProjection
};
//# sourceMappingURL=chunk-Z7PA7HSF.js.map
