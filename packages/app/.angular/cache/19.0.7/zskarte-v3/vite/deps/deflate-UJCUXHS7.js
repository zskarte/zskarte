import {
  inflate_1
} from "./chunk-FPOI74JY.js";
import {
  BaseDecoder
} from "./chunk-O35MJMFX.js";
import "./chunk-NJ4VOZBH.js";

// ../../node_modules/geotiff/dist-module/compression/deflate.js
var DeflateDecoder = class extends BaseDecoder {
  decodeBlock(buffer) {
    return inflate_1(new Uint8Array(buffer)).buffer;
  }
};
export {
  DeflateDecoder as default
};
//# sourceMappingURL=deflate-UJCUXHS7.js.map
