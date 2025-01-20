import {
  TileLayer_default
} from "./chunk-Y22DGWX5.js";
import {
  BaseTile_default
} from "./chunk-4Y2II2FC.js";

// ../../node_modules/ol/layer/Tile.js
var TileLayer = class extends BaseTile_default {
  /**
   * @param {import("./BaseTile.js").Options<TileSourceType>} [options] Tile layer options.
   */
  constructor(options) {
    super(options);
  }
  /**
   * @override
   */
  createRenderer() {
    return new TileLayer_default(this, {
      cacheSize: this.getCacheSize()
    });
  }
};
var Tile_default = TileLayer;

export {
  Tile_default
};
//# sourceMappingURL=chunk-XQ3P2EPI.js.map
