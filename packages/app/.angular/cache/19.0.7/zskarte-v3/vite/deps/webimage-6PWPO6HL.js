import {
  BaseDecoder
} from "./chunk-O35MJMFX.js";
import {
  __async
} from "./chunk-NJ4VOZBH.js";

// ../../node_modules/geotiff/dist-module/compression/webimage.js
var WebImageDecoder = class extends BaseDecoder {
  constructor() {
    super();
    if (typeof createImageBitmap === "undefined") {
      throw new Error("Cannot decode WebImage as `createImageBitmap` is not available");
    } else if (typeof document === "undefined" && typeof OffscreenCanvas === "undefined") {
      throw new Error("Cannot decode WebImage as neither `document` nor `OffscreenCanvas` is not available");
    }
  }
  decode(fileDirectory, buffer) {
    return __async(this, null, function* () {
      const blob = new Blob([buffer]);
      const imageBitmap = yield createImageBitmap(blob);
      let canvas;
      if (typeof document !== "undefined") {
        canvas = document.createElement("canvas");
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
      } else {
        canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      }
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageBitmap, 0, 0);
      return ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height).data.buffer;
    });
  }
};
export {
  WebImageDecoder as default
};
//# sourceMappingURL=webimage-6PWPO6HL.js.map
