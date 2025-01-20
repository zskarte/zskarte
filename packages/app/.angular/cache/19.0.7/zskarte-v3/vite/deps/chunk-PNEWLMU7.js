import {
  TileGrid_default
} from "./chunk-TLKYGVK5.js";
import {
  get3 as get
} from "./chunk-QPOUXWMH.js";

// ../../node_modules/ol/tilegrid/WMTS.js
var WMTSTileGrid = class extends TileGrid_default {
  /**
   * @param {Options} options WMTS options.
   */
  constructor(options) {
    super({
      extent: options.extent,
      origin: options.origin,
      origins: options.origins,
      resolutions: options.resolutions,
      tileSize: options.tileSize,
      tileSizes: options.tileSizes,
      sizes: options.sizes
    });
    this.matrixIds_ = options.matrixIds;
  }
  /**
   * @param {number} z Z.
   * @return {string} MatrixId..
   */
  getMatrixId(z) {
    return this.matrixIds_[z];
  }
  /**
   * Get the list of matrix identifiers.
   * @return {Array<string>} MatrixIds.
   * @api
   */
  getMatrixIds() {
    return this.matrixIds_;
  }
};
var WMTS_default = WMTSTileGrid;
function createFromCapabilitiesMatrixSet(matrixSet, extent, matrixLimits) {
  const resolutions = [];
  const matrixIds = [];
  const origins = [];
  const tileSizes = [];
  const sizes = [];
  matrixLimits = matrixLimits !== void 0 ? matrixLimits : [];
  const supportedCRSPropName = "SupportedCRS";
  const matrixIdsPropName = "TileMatrix";
  const identifierPropName = "Identifier";
  const scaleDenominatorPropName = "ScaleDenominator";
  const topLeftCornerPropName = "TopLeftCorner";
  const tileWidthPropName = "TileWidth";
  const tileHeightPropName = "TileHeight";
  const code = matrixSet[supportedCRSPropName];
  const projection = get(code);
  const metersPerUnit = projection.getMetersPerUnit();
  const switchOriginXY = projection.getAxisOrientation().startsWith("ne");
  matrixSet[matrixIdsPropName].sort(function(a, b) {
    return b[scaleDenominatorPropName] - a[scaleDenominatorPropName];
  });
  matrixSet[matrixIdsPropName].forEach(function(elt) {
    let matrixAvailable;
    if (matrixLimits.length > 0) {
      matrixAvailable = matrixLimits.find(function(elt_ml) {
        if (elt[identifierPropName] == elt_ml[matrixIdsPropName]) {
          return true;
        }
        if (!elt[identifierPropName].includes(":")) {
          return matrixSet[identifierPropName] + ":" + elt[identifierPropName] === elt_ml[matrixIdsPropName];
        }
        return false;
      });
    } else {
      matrixAvailable = true;
    }
    if (matrixAvailable) {
      matrixIds.push(elt[identifierPropName]);
      const resolution = elt[scaleDenominatorPropName] * 28e-5 / metersPerUnit;
      const tileWidth = elt[tileWidthPropName];
      const tileHeight = elt[tileHeightPropName];
      if (switchOriginXY) {
        origins.push([elt[topLeftCornerPropName][1], elt[topLeftCornerPropName][0]]);
      } else {
        origins.push(elt[topLeftCornerPropName]);
      }
      resolutions.push(resolution);
      tileSizes.push(tileWidth == tileHeight ? tileWidth : [tileWidth, tileHeight]);
      sizes.push([elt["MatrixWidth"], elt["MatrixHeight"]]);
    }
  });
  return new WMTSTileGrid({
    extent,
    origins,
    resolutions,
    matrixIds,
    tileSizes,
    sizes
  });
}

export {
  WMTS_default,
  createFromCapabilitiesMatrixSet
};
//# sourceMappingURL=chunk-PNEWLMU7.js.map
