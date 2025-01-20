import {
  BaseTile_default
} from "./chunk-4Y2II2FC.js";
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
  asArrayLike,
  asImageLike,
  create as create2,
  fromTransform
} from "./chunk-PMSTMQL3.js";
import {
  TileRange_default
} from "./chunk-K5VWTFZZ.js";
import {
  createOrUpdate,
  getKey
} from "./chunk-ABQOD32P.js";
import {
  TileState_default
} from "./chunk-WFUVBADM.js";
import {
  Layer_default
} from "./chunk-PGKZJFAO.js";
import {
  BooleanType,
  CallExpression,
  ColorType,
  NumberArrayType,
  NumberType,
  Ops,
  SizeType,
  StringType,
  computeGeometryType,
  newParsingContext,
  parse,
  typeName
} from "./chunk-TDOEFV4W.js";
import {
  EventType_default as EventType_default2,
  Event_default,
  Property_default
} from "./chunk-3JTXEXYF.js";
import {
  toSize
} from "./chunk-EA4JZPIY.js";
import {
  asArray
} from "./chunk-QABMMYJI.js";
import {
  createCanvasContext2D
} from "./chunk-73LIRBW3.js";
import {
  SAFARI_BUG_237906
} from "./chunk-AIKGHEYG.js";
import {
  apply,
  compose,
  create,
  reset,
  rotate,
  scale,
  translate
} from "./chunk-5DM6XDPZ.js";
import {
  assert
} from "./chunk-IRDKPWWT.js";
import {
  fromUserExtent
} from "./chunk-QPOUXWMH.js";
import {
  boundingExtent,
  containsCoordinate,
  getIntersection,
  isEmpty
} from "./chunk-IHYRLUFT.js";
import {
  Disposable_default,
  EventType_default,
  Target_default
} from "./chunk-X7DDFSZC.js";
import {
  clear
} from "./chunk-MEYD4SA6.js";
import {
  abstract,
  getUid
} from "./chunk-JL7CNLN5.js";
import {
  descending
} from "./chunk-LBIH33AC.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-NJ4VOZBH.js";

// ../../node_modules/ol/webgl/BaseTileRepresentation.js
var BaseTileRepresentation = class extends Target_default {
  /**
   * @param {TileRepresentationOptions<TileType>} options The tile representation options.
   */
  constructor(options) {
    super();
    this.tile;
    this.handleTileChange_ = this.handleTileChange_.bind(this);
    this.gutter = options.gutter || 0;
    this.helper = options.helper;
    this.loaded = false;
    this.ready = false;
  }
  /**
   * @param {TileType} tile Tile.
   */
  setTile(tile) {
    if (tile !== this.tile) {
      if (this.tile) {
        this.tile.removeEventListener(EventType_default.CHANGE, this.handleTileChange_);
      }
      this.tile = tile;
      this.loaded = tile.getState() === TileState_default.LOADED;
      if (this.loaded) {
        this.uploadTile();
      } else {
        if (tile instanceof ImageTile_default) {
          const image = tile.getImage();
          if (image instanceof Image && !image.crossOrigin) {
            image.crossOrigin = "anonymous";
          }
        }
        tile.addEventListener(EventType_default.CHANGE, this.handleTileChange_);
      }
    }
  }
  /**
   * @abstract
   * @protected
   */
  uploadTile() {
    abstract();
  }
  setReady() {
    this.ready = true;
    this.dispatchEvent(EventType_default.CHANGE);
  }
  handleTileChange_() {
    if (this.tile.getState() === TileState_default.LOADED) {
      this.loaded = true;
      this.uploadTile();
    }
  }
  /**
   * @param {import("./Helper.js").default} helper The WebGL helper.
   */
  setHelper(helper) {
    this.helper = helper;
    if (this.helper && this.loaded) {
      this.uploadTile();
    }
  }
  /**
   * @override
   */
  disposeInternal() {
    this.setHelper(null);
    this.tile.removeEventListener(EventType_default.CHANGE, this.handleTileChange_);
  }
};
var BaseTileRepresentation_default = BaseTileRepresentation;

// ../../node_modules/ol/webgl.js
var ARRAY_BUFFER = 34962;
var ELEMENT_ARRAY_BUFFER = 34963;
var STREAM_DRAW = 35040;
var STATIC_DRAW = 35044;
var DYNAMIC_DRAW = 35048;
var UNSIGNED_BYTE = 5121;
var UNSIGNED_SHORT = 5123;
var UNSIGNED_INT = 5125;
var FLOAT = 5126;
var CONTEXT_IDS = ["experimental-webgl", "webgl", "webkit-3d", "moz-webgl"];
function getContext(canvas, attributes) {
  attributes = Object.assign({
    preserveDrawingBuffer: true,
    antialias: SAFARI_BUG_237906 ? false : true
    // https://bugs.webkit.org/show_bug.cgi?id=237906
  }, attributes);
  const ii = CONTEXT_IDS.length;
  for (let i = 0; i < ii; ++i) {
    try {
      const context = canvas.getContext(CONTEXT_IDS[i], attributes);
      if (context) {
        return (
          /** @type {!WebGLRenderingContext} */
          context
        );
      }
    } catch (e) {
    }
  }
  return null;
}

// ../../node_modules/ol/webgl/Buffer.js
var BufferUsage = {
  STATIC_DRAW,
  STREAM_DRAW,
  DYNAMIC_DRAW
};
var WebGLArrayBuffer = class {
  /**
   * @param {number} type Buffer type, either ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER.
   * @param {number} [usage] Intended usage, either `STATIC_DRAW`, `STREAM_DRAW` or `DYNAMIC_DRAW`.
   * Default is `STATIC_DRAW`.
   */
  constructor(type, usage) {
    this.array_ = null;
    this.type_ = type;
    assert(type === ARRAY_BUFFER || type === ELEMENT_ARRAY_BUFFER, "A `WebGLArrayBuffer` must either be of type `ELEMENT_ARRAY_BUFFER` or `ARRAY_BUFFER`");
    this.usage_ = usage !== void 0 ? usage : BufferUsage.STATIC_DRAW;
  }
  /**
   * Populates the buffer with an array of the given size (all values will be zeroes).
   * @param {number} size Array size
   * @return {WebGLArrayBuffer} This
   */
  ofSize(size) {
    this.array_ = new (getArrayClassForType(this.type_))(size);
    return this;
  }
  /**
   * Populates the buffer with an array of the given size.
   * @param {Array<number>} array Numerical array
   * @return {WebGLArrayBuffer} This
   */
  fromArray(array) {
    this.array_ = getArrayClassForType(this.type_).from(array);
    return this;
  }
  /**
   * Populates the buffer with a raw binary array buffer.
   * @param {ArrayBuffer} buffer Raw binary buffer to populate the array with. Note that this buffer must have been
   * initialized for the same typed array class.
   * @return {WebGLArrayBuffer} This
   */
  fromArrayBuffer(buffer) {
    this.array_ = new (getArrayClassForType(this.type_))(buffer);
    return this;
  }
  /**
   * @return {number} Buffer type.
   */
  getType() {
    return this.type_;
  }
  /**
   * Will return null if the buffer was not initialized
   * @return {Float32Array|Uint32Array|null} Array.
   */
  getArray() {
    return this.array_;
  }
  /**
   * @param {Float32Array|Uint32Array} array Array.
   */
  setArray(array) {
    const ArrayType = getArrayClassForType(this.type_);
    if (!(array instanceof ArrayType)) {
      throw new Error(`Expected ${ArrayType}`);
    }
    this.array_ = array;
  }
  /**
   * @return {number} Usage.
   */
  getUsage() {
    return this.usage_;
  }
  /**
   * Will return 0 if the buffer is not initialized
   * @return {number} Array size
   */
  getSize() {
    return this.array_ ? this.array_.length : 0;
  }
};
function getArrayClassForType(type) {
  switch (type) {
    case ARRAY_BUFFER:
      return Float32Array;
    case ELEMENT_ARRAY_BUFFER:
      return Uint32Array;
    default:
      return Float32Array;
  }
}
var Buffer_default = WebGLArrayBuffer;

// ../../node_modules/ol/webgl/TileTexture.js
function bindAndConfigure(gl, texture, interpolate) {
  const resampleFilter = interpolate ? gl.LINEAR : gl.NEAREST;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, resampleFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, resampleFilter);
}
function uploadImageTexture(gl, texture, image, interpolate) {
  bindAndConfigure(gl, texture, interpolate);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}
function uploadDataTexture(helper, texture, data, size, bandCount, interpolate) {
  const gl = helper.getGL();
  let textureType;
  let canInterpolate;
  if (data instanceof Float32Array) {
    textureType = gl.FLOAT;
    helper.getExtension("OES_texture_float");
    const extension = helper.getExtension("OES_texture_float_linear");
    canInterpolate = extension !== null;
  } else {
    textureType = gl.UNSIGNED_BYTE;
    canInterpolate = true;
  }
  bindAndConfigure(gl, texture, interpolate && canInterpolate);
  const bytesPerRow = data.byteLength / size[1];
  let unpackAlignment = 1;
  if (bytesPerRow % 8 === 0) {
    unpackAlignment = 8;
  } else if (bytesPerRow % 4 === 0) {
    unpackAlignment = 4;
  } else if (bytesPerRow % 2 === 0) {
    unpackAlignment = 2;
  }
  let format;
  switch (bandCount) {
    case 1: {
      format = gl.LUMINANCE;
      break;
    }
    case 2: {
      format = gl.LUMINANCE_ALPHA;
      break;
    }
    case 3: {
      format = gl.RGB;
      break;
    }
    case 4: {
      format = gl.RGBA;
      break;
    }
    default: {
      throw new Error(`Unsupported number of bands: ${bandCount}`);
    }
  }
  const oldUnpackAlignment = gl.getParameter(gl.UNPACK_ALIGNMENT);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, unpackAlignment);
  gl.texImage2D(gl.TEXTURE_2D, 0, format, size[0], size[1], 0, format, textureType, data);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, oldUnpackAlignment);
}
var pixelContext = null;
function createPixelContext() {
  pixelContext = createCanvasContext2D(1, 1, void 0, {
    willReadFrequently: true
  });
}
var TileTexture = class extends BaseTileRepresentation_default {
  /**
   * @param {import("./BaseTileRepresentation.js").TileRepresentationOptions<TileType>} options The tile texture options.
   */
  constructor(options) {
    super(options);
    this.textures = [];
    this.renderSize_ = toSize(options.grid.getTileSize(options.tile.tileCoord[0]));
    this.bandCount = NaN;
    const coords = new Buffer_default(ARRAY_BUFFER, STATIC_DRAW);
    coords.fromArray([
      0,
      // P0
      1,
      1,
      // P1
      1,
      1,
      // P2
      0,
      0,
      // P3
      0
    ]);
    this.helper.flushBufferData(coords);
    this.coords = coords;
    this.setTile(options.tile);
  }
  /**
   * @override
   * @param {import("./Helper.js").default} helper The WebGL helper.
   */
  setHelper(helper) {
    const gl = this.helper?.getGL();
    if (gl) {
      this.helper.deleteBuffer(this.coords);
      for (let i = 0; i < this.textures.length; ++i) {
        gl.deleteTexture(this.textures[i]);
      }
    }
    super.setHelper(helper);
    if (helper) {
      helper.flushBufferData(this.coords);
    }
  }
  /**
   * @override
   */
  uploadTile() {
    const helper = this.helper;
    const gl = helper.getGL();
    const tile = this.tile;
    this.textures.length = 0;
    let data;
    if (tile instanceof ImageTile_default || tile instanceof Tile_default) {
      data = tile.getImage();
    } else {
      data = tile.getData();
    }
    const image = asImageLike(data);
    if (image) {
      const texture = gl.createTexture();
      this.textures.push(texture);
      this.bandCount = 4;
      uploadImageTexture(gl, texture, image, tile.interpolate);
      this.setReady();
      return;
    }
    data = asArrayLike(data);
    const sourceTileSize = (
      /** @type {DataTile} */
      tile.getSize()
    );
    const pixelSize = [sourceTileSize[0] + 2 * this.gutter, sourceTileSize[1] + 2 * this.gutter];
    const isFloat = data instanceof Float32Array;
    const pixelCount = pixelSize[0] * pixelSize[1];
    const DataType = isFloat ? Float32Array : Uint8Array;
    const bytesPerElement = DataType.BYTES_PER_ELEMENT;
    const bytesPerRow = data.byteLength / pixelSize[1];
    this.bandCount = Math.floor(bytesPerRow / bytesPerElement / pixelSize[0]);
    const textureCount = Math.ceil(this.bandCount / 4);
    if (textureCount === 1) {
      const texture = gl.createTexture();
      this.textures.push(texture);
      uploadDataTexture(helper, texture, data, pixelSize, this.bandCount, tile.interpolate);
      this.setReady();
      return;
    }
    const textureDataArrays = new Array(textureCount);
    for (let textureIndex = 0; textureIndex < textureCount; ++textureIndex) {
      const texture = gl.createTexture();
      this.textures.push(texture);
      const bandCount = textureIndex < textureCount - 1 ? 4 : (this.bandCount - 1) % 4 + 1;
      textureDataArrays[textureIndex] = new DataType(pixelCount * bandCount);
    }
    let dataIndex = 0;
    let rowOffset = 0;
    const colCount = pixelSize[0] * this.bandCount;
    for (let rowIndex = 0; rowIndex < pixelSize[1]; ++rowIndex) {
      for (let colIndex = 0; colIndex < colCount; ++colIndex) {
        const dataValue = data[rowOffset + colIndex];
        const pixelIndex = Math.floor(dataIndex / this.bandCount);
        const bandIndex = colIndex % this.bandCount;
        const textureIndex = Math.floor(bandIndex / 4);
        const textureData = textureDataArrays[textureIndex];
        const bandCount = textureData.length / pixelCount;
        const textureBandIndex = bandIndex % 4;
        textureData[pixelIndex * bandCount + textureBandIndex] = dataValue;
        ++dataIndex;
      }
      rowOffset += bytesPerRow / bytesPerElement;
    }
    for (let textureIndex = 0; textureIndex < textureCount; ++textureIndex) {
      const texture = this.textures[textureIndex];
      const textureData = textureDataArrays[textureIndex];
      const bandCount = textureData.length / pixelCount;
      uploadDataTexture(helper, texture, textureData, pixelSize, bandCount, tile.interpolate);
    }
    this.setReady();
  }
  /**
   * @param {import("../DataTile.js").ImageLike} image The image.
   * @param {number} renderCol The column index (in rendered tile space).
   * @param {number} renderRow The row index (in rendered tile space).
   * @return {Uint8ClampedArray|null} The data.
   * @private
   */
  getImagePixelData_(image, renderCol, renderRow) {
    const gutter = this.gutter;
    const renderWidth = this.renderSize_[0];
    const renderHeight = this.renderSize_[1];
    if (!pixelContext) {
      createPixelContext();
    }
    pixelContext.clearRect(0, 0, 1, 1);
    const sourceWidth = image.width;
    const sourceHeight = image.height;
    const sourceWidthWithoutGutter = sourceWidth - 2 * gutter;
    const sourceHeightWithoutGutter = sourceHeight - 2 * gutter;
    const sourceCol = gutter + Math.floor(sourceWidthWithoutGutter * (renderCol / renderWidth));
    const sourceRow = gutter + Math.floor(sourceHeightWithoutGutter * (renderRow / renderHeight));
    let data;
    try {
      pixelContext.drawImage(image, sourceCol, sourceRow, 1, 1, 0, 0, 1, 1);
      data = pixelContext.getImageData(0, 0, 1, 1).data;
    } catch (err) {
      pixelContext = null;
      return null;
    }
    return data;
  }
  /**
   * @param {import("../DataTile.js").ArrayLike} data The data.
   * @param {import("../size.js").Size} sourceSize The size.
   * @param {number} renderCol The column index (in rendered tile space).
   * @param {number} renderRow The row index (in rendered tile space).
   * @return {import("../DataTile.js").ArrayLike|null} The data.
   * @private
   */
  getArrayPixelData_(data, sourceSize, renderCol, renderRow) {
    const gutter = this.gutter;
    const renderWidth = this.renderSize_[0];
    const renderHeight = this.renderSize_[1];
    const sourceWidthWithoutGutter = sourceSize[0];
    const sourceHeightWithoutGutter = sourceSize[1];
    const sourceWidth = sourceWidthWithoutGutter + 2 * gutter;
    const sourceHeight = sourceHeightWithoutGutter + 2 * gutter;
    const sourceCol = gutter + Math.floor(sourceWidthWithoutGutter * (renderCol / renderWidth));
    const sourceRow = gutter + Math.floor(sourceHeightWithoutGutter * (renderRow / renderHeight));
    if (data instanceof DataView) {
      const bytesPerPixel = data.byteLength / (sourceWidth * sourceHeight);
      const offset2 = bytesPerPixel * (sourceRow * sourceWidth + sourceCol);
      const buffer = data.buffer.slice(offset2, offset2 + bytesPerPixel);
      return new DataView(buffer);
    }
    const offset = this.bandCount * (sourceRow * sourceWidth + sourceCol);
    return data.slice(offset, offset + this.bandCount);
  }
  /**
   * Get data for a pixel.  If the tile is not loaded, null is returned.
   * @param {number} renderCol The column index (in rendered tile space).
   * @param {number} renderRow The row index (in rendered tile space).
   * @return {import("../DataTile.js").ArrayLike|null} The data.
   */
  getPixelData(renderCol, renderRow) {
    if (!this.loaded) {
      return null;
    }
    if (this.tile instanceof DataTile_default) {
      const data = this.tile.getData();
      const arrayData = asArrayLike(data);
      if (arrayData) {
        const sourceSize = this.tile.getSize();
        return this.getArrayPixelData_(arrayData, sourceSize, renderCol, renderRow);
      }
      return this.getImagePixelData_(asImageLike(data), renderCol, renderRow);
    }
    return this.getImagePixelData_(this.tile.getImage(), renderCol, renderRow);
  }
};
var TileTexture_default = TileTexture;

// ../../node_modules/ol/webgl/ContextEventType.js
var ContextEventType_default = {
  LOST: "webglcontextlost",
  RESTORED: "webglcontextrestored"
};

// ../../node_modules/ol/webgl/PostProcessingPass.js
var DEFAULT_VERTEX_SHADER = `
  precision mediump float;

  attribute vec2 a_position;
  varying vec2 v_texCoord;
  varying vec2 v_screenCoord;

  uniform vec2 u_screenSize;

  void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    v_screenCoord = v_texCoord * u_screenSize;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;
var DEFAULT_FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D u_image;
  uniform float u_opacity;

  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord) * u_opacity;
  }
`;
var WebGLPostProcessingPass = class {
  /**
   * @param {Options} options Options.
   */
  constructor(options) {
    this.gl_ = options.webGlContext;
    const gl = this.gl_;
    this.scaleRatio_ = options.scaleRatio || 1;
    this.renderTargetTexture_ = gl.createTexture();
    this.renderTargetTextureSize_ = null;
    this.frameBuffer_ = gl.createFramebuffer();
    this.depthBuffer_ = gl.createRenderbuffer();
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, options.vertexShader || DEFAULT_VERTEX_SHADER);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, options.fragmentShader || DEFAULT_FRAGMENT_SHADER);
    gl.compileShader(fragmentShader);
    this.renderTargetProgram_ = gl.createProgram();
    gl.attachShader(this.renderTargetProgram_, vertexShader);
    gl.attachShader(this.renderTargetProgram_, fragmentShader);
    gl.linkProgram(this.renderTargetProgram_);
    this.renderTargetVerticesBuffer_ = gl.createBuffer();
    const verticesArray = [-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1];
    gl.bindBuffer(gl.ARRAY_BUFFER, this.renderTargetVerticesBuffer_);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesArray), gl.STATIC_DRAW);
    this.renderTargetAttribLocation_ = gl.getAttribLocation(this.renderTargetProgram_, "a_position");
    this.renderTargetUniformLocation_ = gl.getUniformLocation(this.renderTargetProgram_, "u_screenSize");
    this.renderTargetOpacityLocation_ = gl.getUniformLocation(this.renderTargetProgram_, "u_opacity");
    this.renderTargetTextureLocation_ = gl.getUniformLocation(this.renderTargetProgram_, "u_image");
    this.uniforms_ = [];
    options.uniforms && Object.keys(options.uniforms).forEach((name) => {
      this.uniforms_.push({
        value: options.uniforms[name],
        location: gl.getUniformLocation(this.renderTargetProgram_, name)
      });
    });
  }
  getRenderTargetTexture() {
    return this.renderTargetTexture_;
  }
  /**
   * Get the WebGL rendering context
   * @return {WebGLRenderingContext} The rendering context.
   */
  getGL() {
    return this.gl_;
  }
  /**
   * Initialize the render target texture of the post process, make sure it is at the
   * right size and bind it as a render target for the next draw calls.
   * The last step to be initialized will be the one where the primitives are rendered.
   * @param {import("../Map.js").FrameState} frameState current frame state
   */
  init(frameState) {
    const gl = this.getGL();
    const textureSize = [gl.drawingBufferWidth * this.scaleRatio_, gl.drawingBufferHeight * this.scaleRatio_];
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.getFrameBuffer());
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.getDepthBuffer());
    gl.viewport(0, 0, textureSize[0], textureSize[1]);
    if (!this.renderTargetTextureSize_ || this.renderTargetTextureSize_[0] !== textureSize[0] || this.renderTargetTextureSize_[1] !== textureSize[1]) {
      this.renderTargetTextureSize_ = textureSize;
      const level = 0;
      const internalFormat = gl.RGBA;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      const data = null;
      gl.bindTexture(gl.TEXTURE_2D, this.renderTargetTexture_);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, textureSize[0], textureSize[1], border, format, type, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderTargetTexture_, 0);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, textureSize[0], textureSize[1]);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer_);
    }
  }
  /**
   * Render to the next postprocessing pass (or to the canvas if final pass).
   * @param {import("../Map.js").FrameState} frameState current frame state
   * @param {WebGLPostProcessingPass} [nextPass] Next pass, optional
   * @param {function(WebGLRenderingContext, import("../Map.js").FrameState):void} [preCompose] Called before composing.
   * @param {function(WebGLRenderingContext, import("../Map.js").FrameState):void} [postCompose] Called before composing.
   */
  apply(frameState, nextPass, preCompose, postCompose) {
    const gl = this.getGL();
    const size = frameState.size;
    gl.bindFramebuffer(gl.FRAMEBUFFER, nextPass ? nextPass.getFrameBuffer() : null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.renderTargetTexture_);
    if (!nextPass) {
      const canvasId = getUid(gl.canvas);
      if (!frameState.renderTargets[canvasId]) {
        const attributes = gl.getContextAttributes();
        if (attributes && attributes.preserveDrawingBuffer) {
          gl.clearColor(0, 0, 0, 0);
          gl.clearDepth(1);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
        frameState.renderTargets[canvasId] = true;
      }
    }
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.renderTargetVerticesBuffer_);
    gl.useProgram(this.renderTargetProgram_);
    gl.enableVertexAttribArray(this.renderTargetAttribLocation_);
    gl.vertexAttribPointer(this.renderTargetAttribLocation_, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(this.renderTargetUniformLocation_, size[0], size[1]);
    gl.uniform1i(this.renderTargetTextureLocation_, 0);
    const opacity = frameState.layerStatesArray[frameState.layerIndex].opacity;
    gl.uniform1f(this.renderTargetOpacityLocation_, opacity);
    this.applyUniforms(frameState);
    if (preCompose) {
      preCompose(gl, frameState);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (postCompose) {
      postCompose(gl, frameState);
    }
  }
  /**
   * @return {WebGLFramebuffer} Frame buffer
   */
  getFrameBuffer() {
    return this.frameBuffer_;
  }
  /**
   * @return {WebGLRenderbuffer} Depth buffer
   */
  getDepthBuffer() {
    return this.depthBuffer_;
  }
  /**
   * Sets the custom uniforms based on what was given in the constructor.
   * @param {import("../Map.js").FrameState} frameState Frame state.
   * @private
   */
  applyUniforms(frameState) {
    const gl = this.getGL();
    let value;
    let textureSlot = 1;
    this.uniforms_.forEach(function(uniform) {
      value = typeof uniform.value === "function" ? uniform.value(frameState) : uniform.value;
      if (value instanceof HTMLCanvasElement || value instanceof ImageData) {
        if (!uniform.texture) {
          uniform.texture = gl.createTexture();
        }
        gl.activeTexture(gl[`TEXTURE${textureSlot}`]);
        gl.bindTexture(gl.TEXTURE_2D, uniform.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (value instanceof ImageData) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, value.width, value.height, 0, gl.UNSIGNED_BYTE, new Uint8Array(value.data));
        } else {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, value);
        }
        gl.uniform1i(uniform.location, textureSlot++);
      } else if (Array.isArray(value)) {
        switch (value.length) {
          case 2:
            gl.uniform2f(uniform.location, value[0], value[1]);
            return;
          case 3:
            gl.uniform3f(uniform.location, value[0], value[1], value[2]);
            return;
          case 4:
            gl.uniform4f(uniform.location, value[0], value[1], value[2], value[3]);
            return;
          default:
            return;
        }
      } else if (typeof value === "number") {
        gl.uniform1f(uniform.location, value);
      }
    });
  }
};
var PostProcessingPass_default = WebGLPostProcessingPass;

// ../../node_modules/ol/webgl/Helper.js
var DefaultUniform = {
  PROJECTION_MATRIX: "u_projectionMatrix",
  SCREEN_TO_WORLD_MATRIX: "u_screenToWorldMatrix",
  TIME: "u_time",
  ZOOM: "u_zoom",
  RESOLUTION: "u_resolution",
  ROTATION: "u_rotation",
  VIEWPORT_SIZE_PX: "u_viewportSizePx",
  PIXEL_RATIO: "u_pixelRatio",
  HIT_DETECTION: "u_hitDetection"
};
var AttributeType = {
  UNSIGNED_BYTE,
  UNSIGNED_SHORT,
  UNSIGNED_INT,
  FLOAT
};
var canvasCache = {};
function getSharedCanvasCacheKey(key) {
  return "shared/" + key;
}
var uniqueCanvasCacheKeyCount = 0;
function getUniqueCanvasCacheKey() {
  const key = "unique/" + uniqueCanvasCacheKeyCount;
  uniqueCanvasCacheKeyCount += 1;
  return key;
}
function getOrCreateContext(key) {
  let cacheItem = canvasCache[key];
  if (!cacheItem) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    const context = getContext(canvas);
    cacheItem = {
      users: 0,
      context
    };
    canvasCache[key] = cacheItem;
  }
  cacheItem.users += 1;
  return cacheItem.context;
}
function releaseCanvas(key) {
  const cacheItem = canvasCache[key];
  if (!cacheItem) {
    return;
  }
  cacheItem.users -= 1;
  if (cacheItem.users > 0) {
    return;
  }
  const gl = cacheItem.context;
  const extension = gl.getExtension("WEBGL_lose_context");
  if (extension) {
    extension.loseContext();
  }
  const canvas = gl.canvas;
  canvas.width = 1;
  canvas.height = 1;
  delete canvasCache[key];
}
var WebGLHelper = class extends Disposable_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();
    options = options || {};
    this.boundHandleWebGLContextLost_ = this.handleWebGLContextLost.bind(this);
    this.boundHandleWebGLContextRestored_ = this.handleWebGLContextRestored.bind(this);
    this.canvasCacheKey_ = options.canvasCacheKey ? getSharedCanvasCacheKey(options.canvasCacheKey) : getUniqueCanvasCacheKey();
    this.gl_ = getOrCreateContext(this.canvasCacheKey_);
    this.bufferCache_ = {};
    this.extensionCache_ = {};
    this.currentProgram_ = null;
    this.needsToBeRecreated_ = false;
    const canvas = this.gl_.canvas;
    canvas.addEventListener(ContextEventType_default.LOST, this.boundHandleWebGLContextLost_);
    canvas.addEventListener(ContextEventType_default.RESTORED, this.boundHandleWebGLContextRestored_);
    this.offsetRotateMatrix_ = create();
    this.offsetScaleMatrix_ = create();
    this.tmpMat4_ = create2();
    this.uniformLocationsByProgram_ = {};
    this.attribLocationsByProgram_ = {};
    this.uniforms_ = [];
    if (options.uniforms) {
      this.setUniforms(options.uniforms);
    }
    this.postProcessPasses_ = options.postProcesses ? options.postProcesses.map((options2) => new PostProcessingPass_default({
      webGlContext: this.gl_,
      scaleRatio: options2.scaleRatio,
      vertexShader: options2.vertexShader,
      fragmentShader: options2.fragmentShader,
      uniforms: options2.uniforms
    })) : [new PostProcessingPass_default({
      webGlContext: this.gl_
    })];
    this.shaderCompileErrors_ = null;
    this.startTime_ = Date.now();
  }
  /**
   * @param {Object<string, UniformValue>} uniforms Uniform definitions.
   */
  setUniforms(uniforms) {
    this.uniforms_ = [];
    this.addUniforms(uniforms);
  }
  /**
   * @param {Object<string, UniformValue>} uniforms Uniform definitions.
   */
  addUniforms(uniforms) {
    for (const name in uniforms) {
      this.uniforms_.push({
        name,
        value: uniforms[name]
      });
    }
  }
  /**
   * @param {string} canvasCacheKey The canvas cache key.
   * @return {boolean} The provided key matches the one this helper was constructed with.
   */
  canvasCacheKeyMatches(canvasCacheKey) {
    return this.canvasCacheKey_ === getSharedCanvasCacheKey(canvasCacheKey);
  }
  /**
   * Get a WebGL extension.  If the extension is not supported, null is returned.
   * Extensions are cached after they are enabled for the first time.
   * @param {string} name The extension name.
   * @return {Object|null} The extension or null if not supported.
   */
  getExtension(name) {
    if (name in this.extensionCache_) {
      return this.extensionCache_[name];
    }
    const extension = this.gl_.getExtension(name);
    this.extensionCache_[name] = extension;
    return extension;
  }
  /**
   * Just bind the buffer if it's in the cache. Otherwise create
   * the WebGL buffer, bind it, populate it, and add an entry to
   * the cache.
   * @param {import("./Buffer").default} buffer Buffer.
   */
  bindBuffer(buffer) {
    const gl = this.gl_;
    const bufferKey = getUid(buffer);
    let bufferCache = this.bufferCache_[bufferKey];
    if (!bufferCache) {
      const webGlBuffer = gl.createBuffer();
      bufferCache = {
        buffer,
        webGlBuffer
      };
      this.bufferCache_[bufferKey] = bufferCache;
    }
    gl.bindBuffer(buffer.getType(), bufferCache.webGlBuffer);
  }
  /**
   * Update the data contained in the buffer array; this is required for the
   * new data to be rendered
   * @param {import("./Buffer").default} buffer Buffer.
   */
  flushBufferData(buffer) {
    const gl = this.gl_;
    this.bindBuffer(buffer);
    gl.bufferData(buffer.getType(), buffer.getArray(), buffer.getUsage());
  }
  /**
   * @param {import("./Buffer.js").default} buf Buffer.
   */
  deleteBuffer(buf) {
    const bufferKey = getUid(buf);
    delete this.bufferCache_[bufferKey];
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    const canvas = this.gl_.canvas;
    canvas.removeEventListener(ContextEventType_default.LOST, this.boundHandleWebGLContextLost_);
    canvas.removeEventListener(ContextEventType_default.RESTORED, this.boundHandleWebGLContextRestored_);
    releaseCanvas(this.canvasCacheKey_);
    delete this.gl_;
  }
  /**
   * Clear the buffer & set the viewport to draw.
   * Post process passes will be initialized here, the first one being bound as a render target for
   * subsequent draw calls.
   * @param {import("../Map.js").FrameState} frameState current frame state
   * @param {boolean} [disableAlphaBlend] If true, no alpha blending will happen.
   * @param {boolean} [enableDepth] If true, enables depth testing.
   */
  prepareDraw(frameState, disableAlphaBlend, enableDepth) {
    const gl = this.gl_;
    const canvas = this.getCanvas();
    const size = frameState.size;
    const pixelRatio = frameState.pixelRatio;
    if (canvas.width !== size[0] * pixelRatio || canvas.height !== size[1] * pixelRatio) {
      canvas.width = size[0] * pixelRatio;
      canvas.height = size[1] * pixelRatio;
      canvas.style.width = size[0] + "px";
      canvas.style.height = size[1] + "px";
    }
    for (let i = this.postProcessPasses_.length - 1; i >= 0; i--) {
      this.postProcessPasses_[i].init(frameState);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.clearColor(0, 0, 0, 0);
    gl.depthRange(0, 1);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, disableAlphaBlend ? gl.ZERO : gl.ONE_MINUS_SRC_ALPHA);
    if (enableDepth) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }
  }
  /**
   * @param {WebGLFramebuffer|null} frameBuffer The frame buffer.
   * @param {WebGLTexture} [texture] The texture.
   */
  bindFrameBuffer(frameBuffer, texture) {
    const gl = this.getGL();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    if (texture) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }
  }
  /**
   * Bind the frame buffer from the initial render.
   */
  bindInitialFrameBuffer() {
    const gl = this.getGL();
    const frameBuffer = this.postProcessPasses_[0].getFrameBuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    const texture = this.postProcessPasses_[0].getRenderTargetTexture();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }
  /**
   * Prepare a program to use a texture.
   * @param {WebGLTexture} texture The texture.
   * @param {number} slot The texture slot.
   * @param {string} uniformName The corresponding uniform name.
   */
  bindTexture(texture, slot, uniformName) {
    const gl = this.gl_;
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.getUniformLocation(uniformName), slot);
  }
  /**
   * Set up an attribute array buffer for use in the vertex shader.
   * @param {import("./Buffer").default} buffer The buffer.
   * @param {string} attributeName The attribute name.
   * @param {number} size The number of components per attribute vertex.
   */
  bindAttribute(buffer, attributeName, size) {
    const gl = this.getGL();
    this.bindBuffer(buffer);
    const index = this.getAttributeLocation(attributeName);
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
  }
  /**
   * Clear the render target & bind it for future draw operations.
   * This is similar to `prepareDraw`, only post processes will not be applied.
   * Note: the whole viewport will be drawn to the render target, regardless of its size.
   * @param {import("../Map.js").FrameState} frameState current frame state
   * @param {import("./RenderTarget.js").default} renderTarget Render target to draw to
   * @param {boolean} [disableAlphaBlend] If true, no alpha blending will happen.
   * @param {boolean} [enableDepth] If true, enables depth testing.
   */
  prepareDrawToRenderTarget(frameState, renderTarget, disableAlphaBlend, enableDepth) {
    const gl = this.gl_;
    const size = renderTarget.getSize();
    gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget.getFramebuffer());
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderTarget.getDepthbuffer());
    gl.viewport(0, 0, size[0], size[1]);
    gl.bindTexture(gl.TEXTURE_2D, renderTarget.getTexture());
    gl.clearColor(0, 0, 0, 0);
    gl.depthRange(0, 1);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, disableAlphaBlend ? gl.ZERO : gl.ONE_MINUS_SRC_ALPHA);
    if (enableDepth) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }
  }
  /**
   * Execute a draw call based on the currently bound program, texture, buffers, attributes.
   * @param {number} start Start index.
   * @param {number} end End index.
   */
  drawElements(start, end) {
    const gl = this.gl_;
    this.getExtension("OES_element_index_uint");
    const elementType = gl.UNSIGNED_INT;
    const elementSize = 4;
    const numItems = end - start;
    const offsetInBytes = start * elementSize;
    gl.drawElements(gl.TRIANGLES, numItems, elementType, offsetInBytes);
  }
  /**
   * Apply the successive post process passes which will eventually render to the actual canvas.
   * @param {import("../Map.js").FrameState} frameState current frame state
   * @param {function(WebGLRenderingContext, import("../Map.js").FrameState):void} [preCompose] Called before composing.
   * @param {function(WebGLRenderingContext, import("../Map.js").FrameState):void} [postCompose] Called before composing.
   */
  finalizeDraw(frameState, preCompose, postCompose) {
    for (let i = 0, ii = this.postProcessPasses_.length; i < ii; i++) {
      if (i === ii - 1) {
        this.postProcessPasses_[i].apply(frameState, null, preCompose, postCompose);
      } else {
        this.postProcessPasses_[i].apply(frameState, this.postProcessPasses_[i + 1]);
      }
    }
  }
  /**
   * @return {HTMLCanvasElement} Canvas.
   */
  getCanvas() {
    return (
      /** @type {HTMLCanvasElement} */
      this.gl_.canvas
    );
  }
  /**
   * Get the WebGL rendering context
   * @return {WebGLRenderingContext} The rendering context.
   */
  getGL() {
    return this.gl_;
  }
  /**
   * Sets the default matrix uniforms for a given frame state. This is called internally in `prepareDraw`.
   * @param {import("../Map.js").FrameState} frameState Frame state.
   */
  applyFrameState(frameState) {
    const size = frameState.size;
    const rotation = frameState.viewState.rotation;
    const pixelRatio = frameState.pixelRatio;
    this.setUniformFloatValue(DefaultUniform.TIME, (Date.now() - this.startTime_) * 1e-3);
    this.setUniformFloatValue(DefaultUniform.ZOOM, frameState.viewState.zoom);
    this.setUniformFloatValue(DefaultUniform.RESOLUTION, frameState.viewState.resolution);
    this.setUniformFloatValue(DefaultUniform.PIXEL_RATIO, pixelRatio);
    this.setUniformFloatVec2(DefaultUniform.VIEWPORT_SIZE_PX, [size[0], size[1]]);
    this.setUniformFloatValue(DefaultUniform.ROTATION, rotation);
  }
  /**
   * Sets the `u_hitDetection` uniform.
   * @param {boolean} enabled Whether to enable the hit detection code path
   */
  applyHitDetectionUniform(enabled) {
    const loc = this.getUniformLocation(DefaultUniform.HIT_DETECTION);
    this.getGL().uniform1i(loc, enabled ? 1 : 0);
    if (enabled) {
      this.setUniformFloatValue(DefaultUniform.PIXEL_RATIO, 0.5);
    }
  }
  /**
   * Sets the custom uniforms based on what was given in the constructor. This is called internally in `prepareDraw`.
   * @param {import("../Map.js").FrameState} frameState Frame state.
   */
  applyUniforms(frameState) {
    const gl = this.gl_;
    let value;
    let textureSlot = 0;
    this.uniforms_.forEach((uniform) => {
      value = typeof uniform.value === "function" ? uniform.value(frameState) : uniform.value;
      if (value instanceof HTMLCanvasElement || value instanceof HTMLImageElement || value instanceof ImageData || value instanceof WebGLTexture) {
        if (value instanceof WebGLTexture && !uniform.texture) {
          uniform.prevValue = void 0;
          uniform.texture = value;
        } else if (!uniform.texture) {
          uniform.prevValue = void 0;
          uniform.texture = gl.createTexture();
        }
        this.bindTexture(uniform.texture, textureSlot, uniform.name);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const imageReady = !(value instanceof HTMLImageElement) || /** @type {HTMLImageElement} */
        value.complete;
        if (!(value instanceof WebGLTexture) && imageReady && uniform.prevValue !== value) {
          uniform.prevValue = value;
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, value);
        }
        textureSlot++;
      } else if (Array.isArray(value) && value.length === 6) {
        this.setUniformMatrixValue(uniform.name, fromTransform(this.tmpMat4_, value));
      } else if (Array.isArray(value) && value.length <= 4) {
        switch (value.length) {
          case 2:
            gl.uniform2f(this.getUniformLocation(uniform.name), value[0], value[1]);
            return;
          case 3:
            gl.uniform3f(this.getUniformLocation(uniform.name), value[0], value[1], value[2]);
            return;
          case 4:
            gl.uniform4f(this.getUniformLocation(uniform.name), value[0], value[1], value[2], value[3]);
            return;
          default:
            return;
        }
      } else if (typeof value === "number") {
        gl.uniform1f(this.getUniformLocation(uniform.name), value);
      }
    });
  }
  /**
   * Set up a program for use. The program will be set as the current one. Then, the uniforms used
   * in the program will be set based on the current frame state and the helper configuration.
   * @param {WebGLProgram} program Program.
   * @param {import("../Map.js").FrameState} [frameState] Frame state.
   */
  useProgram(program, frameState) {
    const gl = this.gl_;
    gl.useProgram(program);
    this.currentProgram_ = program;
    if (frameState) {
      this.applyFrameState(frameState);
      this.applyUniforms(frameState);
    }
  }
  /**
   * Will attempt to compile a vertex or fragment shader based on source
   * On error, the shader will be returned but
   * `gl.getShaderParameter(shader, gl.COMPILE_STATUS)` will return `true`
   * Use `gl.getShaderInfoLog(shader)` to have details
   * @param {string} source Shader source
   * @param {ShaderType} type VERTEX_SHADER or FRAGMENT_SHADER
   * @return {WebGLShader} Shader object
   */
  compileShader(source, type) {
    const gl = this.gl_;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }
  /**
   * Create a program for a vertex and fragment shader.  Throws if shader compilation fails.
   * @param {string} fragmentShaderSource Fragment shader source.
   * @param {string} vertexShaderSource Vertex shader source.
   * @return {WebGLProgram} Program
   */
  getProgram(fragmentShaderSource, vertexShaderSource) {
    const gl = this.gl_;
    const fragmentShader = this.compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    const vertexShader = this.compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, fragmentShader);
    gl.attachShader(program, vertexShader);
    gl.linkProgram(program);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      const message = `Fragment shader compilation failed: ${gl.getShaderInfoLog(fragmentShader)}`;
      throw new Error(message);
    }
    gl.deleteShader(fragmentShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      const message = `Vertex shader compilation failed: ${gl.getShaderInfoLog(vertexShader)}`;
      throw new Error(message);
    }
    gl.deleteShader(vertexShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = `GL program linking failed: ${gl.getProgramInfoLog(program)}`;
      throw new Error(message);
    }
    return program;
  }
  /**
   * Will get the location from the shader or the cache
   * @param {string} name Uniform name
   * @return {WebGLUniformLocation} uniformLocation
   */
  getUniformLocation(name) {
    const programUid = getUid(this.currentProgram_);
    if (this.uniformLocationsByProgram_[programUid] === void 0) {
      this.uniformLocationsByProgram_[programUid] = {};
    }
    if (this.uniformLocationsByProgram_[programUid][name] === void 0) {
      this.uniformLocationsByProgram_[programUid][name] = this.gl_.getUniformLocation(this.currentProgram_, name);
    }
    return this.uniformLocationsByProgram_[programUid][name];
  }
  /**
   * Will get the location from the shader or the cache
   * @param {string} name Attribute name
   * @return {number} attribLocation
   */
  getAttributeLocation(name) {
    const programUid = getUid(this.currentProgram_);
    if (this.attribLocationsByProgram_[programUid] === void 0) {
      this.attribLocationsByProgram_[programUid] = {};
    }
    if (this.attribLocationsByProgram_[programUid][name] === void 0) {
      this.attribLocationsByProgram_[programUid][name] = this.gl_.getAttribLocation(this.currentProgram_, name);
    }
    return this.attribLocationsByProgram_[programUid][name];
  }
  /**
   * Sets the given transform to apply the rotation/translation/scaling of the given frame state.
   * The resulting transform can be used to convert world space coordinates to view coordinates in the [-1, 1] range.
   * @param {import("../Map.js").FrameState} frameState Frame state.
   * @param {import("../transform").Transform} transform Transform to update.
   * @return {import("../transform").Transform} The updated transform object.
   */
  makeProjectionTransform(frameState, transform) {
    const size = frameState.size;
    const rotation = frameState.viewState.rotation;
    const resolution = frameState.viewState.resolution;
    const center = frameState.viewState.center;
    compose(transform, 0, 0, 2 / (resolution * size[0]), 2 / (resolution * size[1]), -rotation, -center[0], -center[1]);
    return transform;
  }
  /**
   * Give a value for a standard float uniform
   * @param {string} uniform Uniform name
   * @param {number} value Value
   */
  setUniformFloatValue(uniform, value) {
    this.gl_.uniform1f(this.getUniformLocation(uniform), value);
  }
  /**
   * Give a value for a vec2 uniform
   * @param {string} uniform Uniform name
   * @param {Array<number>} value Array of length 4.
   */
  setUniformFloatVec2(uniform, value) {
    this.gl_.uniform2fv(this.getUniformLocation(uniform), value);
  }
  /**
   * Give a value for a vec4 uniform
   * @param {string} uniform Uniform name
   * @param {Array<number>} value Array of length 4.
   */
  setUniformFloatVec4(uniform, value) {
    this.gl_.uniform4fv(this.getUniformLocation(uniform), value);
  }
  /**
   * Give a value for a standard matrix4 uniform
   * @param {string} uniform Uniform name
   * @param {Array<number>} value Matrix value
   */
  setUniformMatrixValue(uniform, value) {
    this.gl_.uniformMatrix4fv(this.getUniformLocation(uniform), false, value);
  }
  /**
   * Will set the currently bound buffer to an attribute of the shader program. Used by `#enableAttributes`
   * internally.
   * @param {string} attribName Attribute name
   * @param {number} size Number of components per attributes
   * @param {number} type UNSIGNED_INT, UNSIGNED_BYTE, UNSIGNED_SHORT or FLOAT
   * @param {number} stride Stride in bytes (0 means attribs are packed)
   * @param {number} offset Offset in bytes
   * @private
   */
  enableAttributeArray_(attribName, size, type, stride, offset) {
    const location = this.getAttributeLocation(attribName);
    if (location < 0) {
      return;
    }
    this.gl_.enableVertexAttribArray(location);
    this.gl_.vertexAttribPointer(location, size, type, false, stride, offset);
  }
  /**
   * Will enable the following attributes to be read from the currently bound buffer,
   * i.e. tell the GPU where to read the different attributes in the buffer. An error in the
   * size/type/order of attributes will most likely break the rendering and throw a WebGL exception.
   * @param {Array<AttributeDescription>} attributes Ordered list of attributes to read from the buffer
   */
  enableAttributes(attributes) {
    const stride = computeAttributesStride(attributes);
    let offset = 0;
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      this.enableAttributeArray_(attr.name, attr.size, attr.type || FLOAT, stride, offset);
      offset += attr.size * getByteSizeFromType(attr.type);
    }
  }
  /**
   * WebGL context was lost
   * @param {WebGLContextEvent} event The context loss event.
   * @private
   */
  handleWebGLContextLost(event) {
    clear(this.bufferCache_);
    this.currentProgram_ = null;
    event.preventDefault();
  }
  /**
   * WebGL context was restored
   * @private
   */
  handleWebGLContextRestored() {
    this.needsToBeRecreated_ = true;
  }
  /**
   * Returns whether this helper needs to be recreated, as the context was lost and then restored.
   * @return {boolean} Whether this helper needs to be recreated.
   */
  needsToBeRecreated() {
    return this.needsToBeRecreated_;
  }
  /**
   * Will create or reuse a given webgl texture and apply the given size. If no image data
   * specified, the texture will be empty, otherwise image data will be used and the `size`
   * parameter will be ignored.  If a Uint8Array is provided for data, a size must also be provided.
   * Note: wrap parameters are set to clamp to edge, min filter is set to linear.
   * @param {Array<number>} size Expected size of the texture
   * @param {ImageData|HTMLImageElement|HTMLCanvasElement|Uint8Array|null} data Image data/object to bind to the texture
   * @param {WebGLTexture} [texture] Existing texture to reuse
   * @param {boolean} [nearest] Use gl.NEAREST for min/mag filter.
   * @return {WebGLTexture} The generated texture
   */
  createTexture(size, data, texture, nearest) {
    const gl = this.gl_;
    texture = texture || gl.createTexture();
    const filter = nearest ? gl.NEAREST : gl.LINEAR;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    if (data instanceof Uint8Array) {
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, size[0], size[1], border, format, type, data);
    } else if (data) {
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, format, type, data);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, size[0], size[1], border, format, type, null);
    }
    return texture;
  }
};
function computeAttributesStride(attributes) {
  let stride = 0;
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    stride += attr.size * getByteSizeFromType(attr.type);
  }
  return stride;
}
function getByteSizeFromType(type) {
  switch (type) {
    case AttributeType.UNSIGNED_BYTE:
      return Uint8Array.BYTES_PER_ELEMENT;
    case AttributeType.UNSIGNED_SHORT:
      return Uint16Array.BYTES_PER_ELEMENT;
    case AttributeType.UNSIGNED_INT:
      return Uint32Array.BYTES_PER_ELEMENT;
    case AttributeType.FLOAT:
    default:
      return Float32Array.BYTES_PER_ELEMENT;
  }
}
var Helper_default = WebGLHelper;

// ../../node_modules/ol/renderer/webgl/Layer.js
var WebGLLayerRenderer = class _WebGLLayerRenderer extends Layer_default {
  /**
   * @param {LayerType} layer Layer.
   * @param {Options} [options] Options.
   */
  constructor(layer, options) {
    super(layer);
    options = options || {};
    this.inversePixelTransform_ = create();
    this.postProcesses_ = options.postProcesses;
    this.uniforms_ = options.uniforms;
    this.helper;
    this.onMapChanged_ = () => {
      this.clearCache();
      this.removeHelper();
    };
    layer.addChangeListener(Property_default.MAP, this.onMapChanged_);
    this.dispatchPreComposeEvent = this.dispatchPreComposeEvent.bind(this);
    this.dispatchPostComposeEvent = this.dispatchPostComposeEvent.bind(this);
  }
  /**
   * @param {WebGLRenderingContext} context The WebGL rendering context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @protected
   */
  dispatchPreComposeEvent(context, frameState) {
    const layer = this.getLayer();
    if (layer.hasListener(EventType_default2.PRECOMPOSE)) {
      const event = new Event_default(EventType_default2.PRECOMPOSE, void 0, frameState, context);
      layer.dispatchEvent(event);
    }
  }
  /**
   * @param {WebGLRenderingContext} context The WebGL rendering context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @protected
   */
  dispatchPostComposeEvent(context, frameState) {
    const layer = this.getLayer();
    if (layer.hasListener(EventType_default2.POSTCOMPOSE)) {
      const event = new Event_default(EventType_default2.POSTCOMPOSE, void 0, frameState, context);
      layer.dispatchEvent(event);
    }
  }
  /**
   * Reset options (only handles uniforms).
   * @param {Options} options Options.
   */
  reset(options) {
    this.uniforms_ = options.uniforms;
    if (this.helper) {
      this.helper.setUniforms(this.uniforms_);
    }
  }
  /**
   * @protected
   */
  removeHelper() {
    if (this.helper) {
      this.helper.dispose();
      delete this.helper;
    }
  }
  /**
   * Determine whether renderFrame should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   * @override
   */
  prepareFrame(frameState) {
    if (this.getLayer().getRenderSource()) {
      let incrementGroup = true;
      let groupNumber = -1;
      let className;
      for (let i = 0, ii = frameState.layerStatesArray.length; i < ii; i++) {
        const layer = frameState.layerStatesArray[i].layer;
        const renderer = layer.getRenderer();
        if (!(renderer instanceof _WebGLLayerRenderer)) {
          incrementGroup = true;
          continue;
        }
        const layerClassName = layer.getClassName();
        if (incrementGroup || layerClassName !== className) {
          groupNumber += 1;
          incrementGroup = false;
        }
        className = layerClassName;
        if (renderer === this) {
          break;
        }
      }
      const canvasCacheKey = "map/" + frameState.mapId + "/group/" + groupNumber;
      if (!this.helper || !this.helper.canvasCacheKeyMatches(canvasCacheKey) || this.helper.needsToBeRecreated()) {
        this.removeHelper();
        this.helper = new Helper_default({
          postProcesses: this.postProcesses_,
          uniforms: this.uniforms_,
          canvasCacheKey
        });
        if (className) {
          this.helper.getCanvas().className = className;
        }
        this.afterHelperCreated();
      }
    }
    return this.prepareFrameInternal(frameState);
  }
  /**
   * @protected
   */
  afterHelperCreated() {
  }
  /**
   * Determine whether renderFrame should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   * @protected
   */
  prepareFrameInternal(frameState) {
    return true;
  }
  /**
   * @protected
   */
  clearCache() {
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    this.clearCache();
    this.removeHelper();
    this.getLayer()?.removeChangeListener(Property_default.MAP, this.onMapChanged_);
    super.disposeInternal();
  }
  /**
   * @param {import("../../render/EventType.js").default} type Event type.
   * @param {WebGLRenderingContext} context The rendering context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @private
   */
  dispatchRenderEvent_(type, context, frameState) {
    const layer = this.getLayer();
    if (layer.hasListener(type)) {
      compose(this.inversePixelTransform_, 0, 0, frameState.pixelRatio, -frameState.pixelRatio, 0, 0, -frameState.size[1]);
      const event = new Event_default(type, this.inversePixelTransform_, frameState, context);
      layer.dispatchEvent(event);
    }
  }
  /**
   * @param {WebGLRenderingContext} context The rendering context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @protected
   */
  preRender(context, frameState) {
    this.dispatchRenderEvent_(EventType_default2.PRERENDER, context, frameState);
  }
  /**
   * @param {WebGLRenderingContext} context The rendering context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @protected
   */
  postRender(context, frameState) {
    this.dispatchRenderEvent_(EventType_default2.POSTRENDER, context, frameState);
  }
};
var Layer_default2 = WebGLLayerRenderer;

// ../../node_modules/ol/renderer/webgl/TileLayerBase.js
var Uniforms = {
  TILE_TRANSFORM: "u_tileTransform",
  TRANSITION_ALPHA: "u_transitionAlpha",
  DEPTH: "u_depth",
  RENDER_EXTENT: "u_renderExtent",
  // intersection of layer, source, and view extent
  PATTERN_ORIGIN: "u_patternOrigin",
  RESOLUTION: "u_resolution",
  ZOOM: "u_zoom",
  GLOBAL_ALPHA: "u_globalAlpha",
  PROJECTION_MATRIX: "u_projectionMatrix",
  SCREEN_TO_WORLD_MATRIX: "u_screenToWorldMatrix"
};
function depthForZ(z) {
  return 1 / (z + 2);
}
function newTileRepresentationLookup() {
  return {
    tileIds: /* @__PURE__ */ new Set(),
    representationsByZ: {}
  };
}
function lookupHasTile(tileRepresentationLookup, tile) {
  return tileRepresentationLookup.tileIds.has(getUid(tile));
}
function addTileRepresentationToLookup(tileRepresentationLookup, tileRepresentation, z) {
  const representationsByZ = tileRepresentationLookup.representationsByZ;
  if (!(z in representationsByZ)) {
    representationsByZ[z] = /* @__PURE__ */ new Set();
  }
  representationsByZ[z].add(tileRepresentation);
  tileRepresentationLookup.tileIds.add(getUid(tileRepresentation.tile));
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
function getCacheKey(source, tileCoord) {
  return `${source.getKey()},${source.getRevision()},${getKey(tileCoord)}`;
}
var WebGLBaseTileLayerRenderer = class extends Layer_default2 {
  /**
   * @param {LayerType} tileLayer Tile layer.
   * @param {Options} options Options.
   */
  constructor(tileLayer, options) {
    super(tileLayer, {
      uniforms: options.uniforms,
      postProcesses: options.postProcesses
    });
    this.renderComplete = false;
    this.tileTransform_ = create();
    this.tempMat4 = create2();
    this.tempTileRange_ = new TileRange_default(0, 0, 0, 0);
    this.tempTileCoord_ = createOrUpdate(0, 0, 0);
    this.tempSize_ = [0, 0];
    const cacheSize = options.cacheSize !== void 0 ? options.cacheSize : 512;
    this.tileRepresentationCache = new LRUCache_default(cacheSize);
    this.frameState = null;
    this.renderedProjection_ = void 0;
  }
  /**
   * @param {Options} options Options.
   * @override
   */
  reset(options) {
    super.reset({
      uniforms: options.uniforms
    });
  }
  /**
   * Determine whether renderFrame should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   * @override
   */
  prepareFrameInternal(frameState) {
    if (!this.renderedProjection_) {
      this.renderedProjection_ = frameState.viewState.projection;
    } else if (frameState.viewState.projection !== this.renderedProjection_) {
      this.clearCache();
      this.renderedProjection_ = frameState.viewState.projection;
    }
    const layer = this.getLayer();
    const source = layer.getRenderSource();
    if (!source) {
      return false;
    }
    if (isEmpty(getRenderExtent(frameState, frameState.extent))) {
      return false;
    }
    return source.getState() === "ready";
  }
  /**
   * @abstract
   * @param {import("../../webgl/BaseTileRepresentation.js").TileRepresentationOptions<TileType>} options tile representation options
   * @return {TileRepresentation} A new tile representation
   * @protected
   */
  createTileRepresentation(options) {
    return abstract();
  }
  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {import("../../extent.js").Extent} extent The extent to be rendered.
   * @param {number} initialZ The zoom level.
   * @param {TileRepresentationLookup} tileRepresentationLookup The zoom level.
   * @param {number} preload Number of additional levels to load.
   */
  enqueueTiles(frameState, extent, initialZ, tileRepresentationLookup, preload) {
    const viewState = frameState.viewState;
    const tileLayer = this.getLayer();
    const tileSource = tileLayer.getRenderSource();
    const tileGrid = tileSource.getTileGridForProjection(viewState.projection);
    const gutter = tileSource.getGutterForProjection(viewState.projection);
    const tileSourceKey = getUid(tileSource);
    if (!(tileSourceKey in frameState.wantedTiles)) {
      frameState.wantedTiles[tileSourceKey] = {};
    }
    const wantedTiles = frameState.wantedTiles[tileSourceKey];
    const tileRepresentationCache = this.tileRepresentationCache;
    const map = tileLayer.getMapInternal();
    const minZ = Math.max(initialZ - preload, tileGrid.getMinZoom(), tileGrid.getZForResolution(Math.min(tileLayer.getMaxResolution(), map ? map.getView().getResolutionForZoom(Math.max(tileLayer.getMinZoom(), 0)) : tileGrid.getResolution(0)), tileSource.zDirection));
    for (let z = initialZ; z >= minZ; --z) {
      const tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z, this.tempTileRange_);
      const tileResolution = tileGrid.getResolution(z);
      for (let x = tileRange.minX; x <= tileRange.maxX; ++x) {
        for (let y = tileRange.minY; y <= tileRange.maxY; ++y) {
          const tileCoord = createOrUpdate(z, x, y, this.tempTileCoord_);
          const cacheKey = getCacheKey(tileSource, tileCoord);
          let tileRepresentation;
          let tile;
          if (tileRepresentationCache.containsKey(cacheKey)) {
            tileRepresentation = tileRepresentationCache.get(cacheKey);
            tile = tileRepresentation.tile;
          }
          if (!tileRepresentation || tileRepresentation.tile.key !== tileSource.getKey()) {
            tile = tileSource.getTile(z, x, y, frameState.pixelRatio, viewState.projection);
            if (!tile) {
              continue;
            }
          }
          if (lookupHasTile(tileRepresentationLookup, tile)) {
            continue;
          }
          if (!tileRepresentation) {
            tileRepresentation = this.createTileRepresentation({
              tile,
              grid: tileGrid,
              helper: this.helper,
              gutter
            });
            tileRepresentationCache.set(cacheKey, tileRepresentation);
          } else {
            tileRepresentation.setTile(tile);
          }
          addTileRepresentationToLookup(tileRepresentationLookup, tileRepresentation, z);
          const tileQueueKey = tile.getKey();
          wantedTiles[tileQueueKey] = true;
          if (tile.getState() === TileState_default.IDLE) {
            if (!frameState.tileQueue.isKeyQueued(tileQueueKey)) {
              frameState.tileQueue.enqueue([tile, tileSourceKey, tileGrid.getTileCoordCenter(tileCoord), tileResolution]);
            }
          }
        }
      }
    }
  }
  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {boolean} tilesWithAlpha True if at least one of the rendered tiles has alpha
   * @protected
   */
  beforeTilesRender(frameState, tilesWithAlpha) {
    this.helper.prepareDraw(this.frameState, !tilesWithAlpha, true);
  }
  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} If returns false, tile mask rendering will be skipped
   * @protected
   */
  beforeTilesMaskRender(frameState) {
    return false;
  }
  /**
   * @param {TileRepresentation} tileRepresentation Tile representation
   * @param {import("../../transform.js").Transform} tileTransform Tile transform
   * @param {import("../../Map.js").FrameState} frameState Frame state
   * @param {import("../../extent.js").Extent} renderExtent Render extent
   * @param {number} tileResolution Tile resolution
   * @param {import("../../size.js").Size} tileSize Tile size
   * @param {import("../../coordinate.js").Coordinate} tileOrigin Tile origin
   * @param {import("../../extent.js").Extent} tileExtent tile Extent
   * @param {number} depth Depth
   * @param {number} gutter Gutter
   * @param {number} alpha Alpha
   * @protected
   */
  renderTile(tileRepresentation, tileTransform, frameState, renderExtent, tileResolution, tileSize, tileOrigin, tileExtent, depth, gutter, alpha) {
  }
  /**
   * @param {TileRepresentation} tileRepresentation Tile representation
   * @param {number} tileZ Tile Z
   * @param {import("../../extent.js").Extent} extent Render extent
   * @param {number} depth Depth
   * @protected
   */
  renderTileMask(tileRepresentation, tileZ, extent, depth) {
  }
  drawTile_(frameState, tileRepresentation, tileZ, gutter, extent, alphaLookup, tileGrid) {
    if (!tileRepresentation.ready) {
      return;
    }
    const tile = tileRepresentation.tile;
    const tileCoord = tile.tileCoord;
    const tileCoordKey = getKey(tileCoord);
    const alpha = tileCoordKey in alphaLookup ? alphaLookup[tileCoordKey] : 1;
    const tileResolution = tileGrid.getResolution(tileZ);
    const tileSize = toSize(tileGrid.getTileSize(tileZ), this.tempSize_);
    const tileOrigin = tileGrid.getOrigin(tileZ);
    const tileExtent = tileGrid.getTileCoordExtent(tileCoord);
    const depth = alpha < 1 ? -1 : depthForZ(tileZ);
    if (alpha < 1) {
      frameState.animate = true;
    }
    const viewState = frameState.viewState;
    const centerX = viewState.center[0];
    const centerY = viewState.center[1];
    const tileWidthWithGutter = tileSize[0] + 2 * gutter;
    const tileHeightWithGutter = tileSize[1] + 2 * gutter;
    const aspectRatio = tileWidthWithGutter / tileHeightWithGutter;
    const centerI = (centerX - tileOrigin[0]) / (tileSize[0] * tileResolution);
    const centerJ = (tileOrigin[1] - centerY) / (tileSize[1] * tileResolution);
    const tileScale = viewState.resolution / tileResolution;
    const tileCenterI = tileCoord[1];
    const tileCenterJ = tileCoord[2];
    reset(this.tileTransform_);
    scale(this.tileTransform_, 2 / (frameState.size[0] * tileScale / tileWidthWithGutter), -2 / (frameState.size[1] * tileScale / tileWidthWithGutter));
    rotate(this.tileTransform_, viewState.rotation);
    scale(this.tileTransform_, 1, 1 / aspectRatio);
    translate(this.tileTransform_, (tileSize[0] * (tileCenterI - centerI) - gutter) / tileWidthWithGutter, (tileSize[1] * (tileCenterJ - centerJ) - gutter) / tileHeightWithGutter);
    this.renderTile(
      /** @type {TileRepresentation} */
      tileRepresentation,
      this.tileTransform_,
      frameState,
      extent,
      tileResolution,
      tileSize,
      tileOrigin,
      tileExtent,
      depth,
      gutter,
      alpha
    );
  }
  /**
   * Render the layer.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {HTMLElement} The rendered element.
   * @override
   */
  renderFrame(frameState) {
    this.frameState = frameState;
    this.renderComplete = true;
    const gl = this.helper.getGL();
    this.preRender(gl, frameState);
    const viewState = frameState.viewState;
    const tileLayer = this.getLayer();
    const tileSource = tileLayer.getRenderSource();
    const tileGrid = tileSource.getTileGridForProjection(viewState.projection);
    const gutter = tileSource.getGutterForProjection(viewState.projection);
    const extent = getRenderExtent(frameState, frameState.extent);
    const z = tileGrid.getZForResolution(viewState.resolution, tileSource.zDirection);
    const tileRepresentationLookup = newTileRepresentationLookup();
    const preload = tileLayer.getPreload();
    if (frameState.nextExtent) {
      const targetZ = tileGrid.getZForResolution(viewState.nextResolution, tileSource.zDirection);
      const nextExtent = getRenderExtent(frameState, frameState.nextExtent);
      this.enqueueTiles(frameState, nextExtent, targetZ, tileRepresentationLookup, preload);
    }
    this.enqueueTiles(frameState, extent, z, tileRepresentationLookup, 0);
    if (preload > 0) {
      setTimeout(() => {
        this.enqueueTiles(frameState, extent, z - 1, tileRepresentationLookup, preload - 1);
      }, 0);
    }
    const alphaLookup = {};
    let blend = false;
    const representationsByZ = tileRepresentationLookup.representationsByZ;
    if (z in representationsByZ) {
      const uid = getUid(this);
      const time = frameState.time;
      for (const tileRepresentation of representationsByZ[z]) {
        const tile = tileRepresentation.tile;
        if ((tile instanceof Tile_default || tile instanceof DataTile_default2) && tile.getState() === TileState_default.EMPTY) {
          continue;
        }
        const tileCoord = tile.tileCoord;
        if (tileRepresentation.ready) {
          const alpha = tile.getAlpha(uid, time);
          if (alpha === 1) {
            tile.endTransition(uid);
            continue;
          }
          blend = true;
          const tileCoordKey = getKey(tileCoord);
          alphaLookup[tileCoordKey] = alpha;
        }
        this.renderComplete = false;
        const coveredByChildren = this.findAltTiles_(tileGrid, tileCoord, z + 1, tileRepresentationLookup);
        if (coveredByChildren) {
          continue;
        }
        const minZoom = tileGrid.getMinZoom();
        for (let parentZ = z - 1; parentZ >= minZoom; --parentZ) {
          const coveredByParent = this.findAltTiles_(tileGrid, tileCoord, parentZ, tileRepresentationLookup);
          if (coveredByParent) {
            break;
          }
        }
      }
    }
    const zs = Object.keys(representationsByZ).map(Number).sort(descending);
    const renderTileMask = this.beforeTilesMaskRender(frameState);
    if (renderTileMask) {
      for (let j = 0, jj = zs.length; j < jj; ++j) {
        const tileZ = zs[j];
        for (const tileRepresentation of representationsByZ[tileZ]) {
          const tileCoord = tileRepresentation.tile.tileCoord;
          const tileCoordKey = getKey(tileCoord);
          if (tileCoordKey in alphaLookup) {
            continue;
          }
          const tileExtent = tileGrid.getTileCoordExtent(tileCoord);
          this.renderTileMask(
            /** @type {TileRepresentation} */
            tileRepresentation,
            tileZ,
            tileExtent,
            depthForZ(tileZ)
          );
        }
      }
    }
    this.beforeTilesRender(frameState, blend);
    for (let j = 0, jj = zs.length; j < jj; ++j) {
      const tileZ = zs[j];
      for (const tileRepresentation of representationsByZ[tileZ]) {
        const tileCoord = tileRepresentation.tile.tileCoord;
        const tileCoordKey = getKey(tileCoord);
        if (tileCoordKey in alphaLookup) {
          continue;
        }
        this.drawTile_(frameState, tileRepresentation, tileZ, gutter, extent, alphaLookup, tileGrid);
      }
    }
    if (z in representationsByZ) {
      for (const tileRepresentation of representationsByZ[z]) {
        const tileCoord = tileRepresentation.tile.tileCoord;
        const tileCoordKey = getKey(tileCoord);
        if (tileCoordKey in alphaLookup) {
          this.drawTile_(frameState, tileRepresentation, z, gutter, extent, alphaLookup, tileGrid);
        }
      }
    }
    this.beforeFinalize(frameState);
    this.helper.finalizeDraw(frameState, this.dispatchPreComposeEvent, this.dispatchPostComposeEvent);
    const canvas = this.helper.getCanvas();
    const tileRepresentationCache = this.tileRepresentationCache;
    while (tileRepresentationCache.canExpireCache()) {
      const tileRepresentation = tileRepresentationCache.pop();
      tileRepresentation.dispose();
    }
    this.postRender(gl, frameState);
    return canvas;
  }
  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @protected
   */
  beforeFinalize(frameState) {
    return;
  }
  /**
   * Look for tiles covering the provided tile coordinate at an alternate
   * zoom level.  Loaded tiles will be added to the provided tile representation lookup.
   * @param {import("../../tilegrid/TileGrid.js").default} tileGrid The tile grid.
   * @param {import("../../tilecoord.js").TileCoord} tileCoord The target tile coordinate.
   * @param {number} altZ The alternate zoom level.
   * @param {TileRepresentationLookup} tileRepresentationLookup Lookup of
   * tile representations by zoom level.
   * @return {boolean} The tile coordinate is covered by loaded tiles at the alternate zoom level.
   * @private
   */
  findAltTiles_(tileGrid, tileCoord, altZ, tileRepresentationLookup) {
    const tileRange = tileGrid.getTileRangeForTileCoordAndZ(tileCoord, altZ, this.tempTileRange_);
    if (!tileRange) {
      return false;
    }
    let covered = true;
    const tileRepresentationCache = this.tileRepresentationCache;
    const source = this.getLayer().getRenderSource();
    for (let x = tileRange.minX; x <= tileRange.maxX; ++x) {
      for (let y = tileRange.minY; y <= tileRange.maxY; ++y) {
        const cacheKey = getCacheKey(source, [altZ, x, y]);
        let loaded = false;
        if (tileRepresentationCache.containsKey(cacheKey)) {
          const tileRepresentation = tileRepresentationCache.get(cacheKey);
          if (tileRepresentation.ready && !lookupHasTile(tileRepresentationLookup, tileRepresentation.tile)) {
            addTileRepresentationToLookup(tileRepresentationLookup, tileRepresentation, altZ);
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
   * @override
   */
  clearCache() {
    super.clearCache();
    const tileRepresentationCache = this.tileRepresentationCache;
    tileRepresentationCache.forEach((tileRepresentation) => tileRepresentation.dispose());
    tileRepresentationCache.clear();
  }
  /**
   * @override
   */
  afterHelperCreated() {
    super.afterHelperCreated();
    this.tileRepresentationCache.forEach((tileRepresentation) => tileRepresentation.setHelper(this.helper));
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    super.disposeInternal();
    delete this.frameState;
  }
};
var TileLayerBase_default = WebGLBaseTileLayerRenderer;

// ../../node_modules/ol/renderer/webgl/TileLayer.js
var Uniforms2 = __spreadProps(__spreadValues({}, Uniforms), {
  TILE_TEXTURE_ARRAY: "u_tileTextures",
  TEXTURE_PIXEL_WIDTH: "u_texturePixelWidth",
  TEXTURE_PIXEL_HEIGHT: "u_texturePixelHeight",
  TEXTURE_RESOLUTION: "u_textureResolution",
  // map units per texture pixel
  TEXTURE_ORIGIN_X: "u_textureOriginX",
  // map x coordinate of left edge of texture
  TEXTURE_ORIGIN_Y: "u_textureOriginY"
  // map y coordinate of top edge of texture
});
var Attributes = {
  TEXTURE_COORD: "a_textureCoord"
};
var attributeDescriptions = [{
  name: Attributes.TEXTURE_COORD,
  size: 2,
  type: AttributeType.FLOAT
}];
var WebGLTileLayerRenderer = class extends TileLayerBase_default {
  /**
   * @param {LayerType} tileLayer Tile layer.
   * @param {Options} options Options.
   */
  constructor(tileLayer, options) {
    super(tileLayer, options);
    this.program_;
    this.vertexShader_ = options.vertexShader;
    this.fragmentShader_ = options.fragmentShader;
    this.indices_ = new Buffer_default(ELEMENT_ARRAY_BUFFER, STATIC_DRAW);
    this.indices_.fromArray([0, 1, 3, 1, 2, 3]);
    this.paletteTextures_ = options.paletteTextures || [];
  }
  /**
   * @param {Options} options Options.
   * @override
   */
  reset(options) {
    super.reset(options);
    if (this.helper) {
      const gl = this.helper.getGL();
      for (const paletteTexture of this.paletteTextures_) {
        paletteTexture.delete(gl);
      }
    }
    this.vertexShader_ = options.vertexShader;
    this.fragmentShader_ = options.fragmentShader;
    this.paletteTextures_ = options.paletteTextures || [];
    if (this.helper) {
      this.program_ = this.helper.getProgram(this.fragmentShader_, this.vertexShader_);
      const gl = this.helper.getGL();
      for (const paletteTexture of this.paletteTextures_) {
        paletteTexture.getTexture(gl);
      }
    }
  }
  /**
   * @override
   */
  afterHelperCreated() {
    super.afterHelperCreated();
    const gl = this.helper.getGL();
    for (const paletteTexture of this.paletteTextures_) {
      paletteTexture.getTexture(gl);
    }
    this.program_ = this.helper.getProgram(this.fragmentShader_, this.vertexShader_);
    this.helper.flushBufferData(this.indices_);
  }
  /**
   * @override
   */
  removeHelper() {
    if (this.helper) {
      const gl = this.helper.getGL();
      for (const paletteTexture of this.paletteTextures_) {
        paletteTexture.delete(gl);
      }
    }
    super.removeHelper();
  }
  /**
   * @override
   */
  createTileRepresentation(options) {
    return new TileTexture_default(options);
  }
  /**
   * @override
   */
  beforeTilesRender(frameState, tilesWithAlpha) {
    super.beforeTilesRender(frameState, tilesWithAlpha);
    this.helper.useProgram(this.program_, frameState);
  }
  /**
   * @override
   */
  renderTile(tileTexture, tileTransform, frameState, renderExtent, tileResolution, tileSize, tileOrigin, tileExtent, depth, gutter, alpha) {
    const gl = this.helper.getGL();
    this.helper.bindBuffer(tileTexture.coords);
    this.helper.bindBuffer(this.indices_);
    this.helper.enableAttributes(attributeDescriptions);
    let textureSlot = 0;
    while (textureSlot < tileTexture.textures.length) {
      const uniformName = `${Uniforms2.TILE_TEXTURE_ARRAY}[${textureSlot}]`;
      this.helper.bindTexture(tileTexture.textures[textureSlot], textureSlot, uniformName);
      ++textureSlot;
    }
    for (let paletteIndex = 0; paletteIndex < this.paletteTextures_.length; ++paletteIndex) {
      const paletteTexture = this.paletteTextures_[paletteIndex];
      const texture = paletteTexture.getTexture(gl);
      this.helper.bindTexture(texture, textureSlot, paletteTexture.name);
      ++textureSlot;
    }
    const viewState = frameState.viewState;
    const tileWidthWithGutter = tileSize[0] + 2 * gutter;
    const tileHeightWithGutter = tileSize[1] + 2 * gutter;
    const tile = tileTexture.tile;
    const tileCoord = tile.tileCoord;
    const tileCenterI = tileCoord[1];
    const tileCenterJ = tileCoord[2];
    this.helper.setUniformMatrixValue(Uniforms2.TILE_TRANSFORM, fromTransform(this.tempMat4, tileTransform));
    this.helper.setUniformFloatValue(Uniforms2.TRANSITION_ALPHA, alpha);
    this.helper.setUniformFloatValue(Uniforms2.DEPTH, depth);
    let gutterExtent = renderExtent;
    if (gutter > 0) {
      gutterExtent = tileExtent;
      getIntersection(gutterExtent, renderExtent, gutterExtent);
    }
    this.helper.setUniformFloatVec4(Uniforms2.RENDER_EXTENT, gutterExtent);
    this.helper.setUniformFloatValue(Uniforms2.RESOLUTION, viewState.resolution);
    this.helper.setUniformFloatValue(Uniforms2.ZOOM, viewState.zoom);
    this.helper.setUniformFloatValue(Uniforms2.TEXTURE_PIXEL_WIDTH, tileWidthWithGutter);
    this.helper.setUniformFloatValue(Uniforms2.TEXTURE_PIXEL_HEIGHT, tileHeightWithGutter);
    this.helper.setUniformFloatValue(Uniforms2.TEXTURE_RESOLUTION, tileResolution);
    this.helper.setUniformFloatValue(Uniforms2.TEXTURE_ORIGIN_X, tileOrigin[0] + tileCenterI * tileSize[0] * tileResolution - gutter * tileResolution);
    this.helper.setUniformFloatValue(Uniforms2.TEXTURE_ORIGIN_Y, tileOrigin[1] - tileCenterJ * tileSize[1] * tileResolution + gutter * tileResolution);
    this.helper.drawElements(0, this.indices_.getSize());
  }
  /**
   * @param {import("../../pixel.js").Pixel} pixel Pixel.
   * @return {Uint8ClampedArray|Uint8Array|Float32Array|DataView} Data at the pixel location.
   * @override
   */
  getData(pixel) {
    const gl = this.helper.getGL();
    if (!gl) {
      return null;
    }
    const frameState = this.frameState;
    if (!frameState) {
      return null;
    }
    const layer = this.getLayer();
    const coordinate = apply(frameState.pixelToCoordinateTransform, pixel.slice());
    const viewState = frameState.viewState;
    const layerExtent = layer.getExtent();
    if (layerExtent) {
      if (!containsCoordinate(fromUserExtent(layerExtent, viewState.projection), coordinate)) {
        return null;
      }
    }
    const sources = layer.getSources(boundingExtent([coordinate]), viewState.resolution);
    let i, source, tileGrid;
    for (i = sources.length - 1; i >= 0; --i) {
      source = sources[i];
      if (source.getState() === "ready") {
        tileGrid = source.getTileGridForProjection(viewState.projection);
        if (source.getWrapX()) {
          break;
        }
        const gridExtent = tileGrid.getExtent();
        if (!gridExtent || containsCoordinate(gridExtent, coordinate)) {
          break;
        }
      }
    }
    if (i < 0) {
      return null;
    }
    const tileTextureCache = this.tileRepresentationCache;
    for (let z = tileGrid.getZForResolution(viewState.resolution); z >= tileGrid.getMinZoom(); --z) {
      const tileCoord = tileGrid.getTileCoordForCoordAndZ(coordinate, z);
      const cacheKey = getCacheKey(source, tileCoord);
      if (!tileTextureCache.containsKey(cacheKey)) {
        continue;
      }
      const tileTexture = tileTextureCache.get(cacheKey);
      const tile = tileTexture.tile;
      if ((tile instanceof Tile_default || tile instanceof DataTile_default2) && tile.getState() === TileState_default.EMPTY) {
        return null;
      }
      if (!tileTexture.loaded) {
        continue;
      }
      const tileOrigin = tileGrid.getOrigin(z);
      const tileSize = toSize(tileGrid.getTileSize(z));
      const tileResolution = tileGrid.getResolution(z);
      const col = (coordinate[0] - tileOrigin[0]) / tileResolution - tileCoord[1] * tileSize[0];
      const row = (tileOrigin[1] - coordinate[1]) / tileResolution - tileCoord[2] * tileSize[1];
      return tileTexture.getPixelData(col, row);
    }
    return null;
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    const helper = this.helper;
    if (helper) {
      const gl = helper.getGL();
      for (const paletteTexture of this.paletteTextures_) {
        paletteTexture.delete(gl);
      }
      this.paletteTextures_.length = 0;
      gl.deleteProgram(this.program_);
      delete this.program_;
      helper.deleteBuffer(this.indices_);
    }
    super.disposeInternal();
    delete this.indices_;
  }
};
var TileLayer_default = WebGLTileLayerRenderer;

// ../../node_modules/ol/webgl/PaletteTexture.js
var PaletteTexture = class {
  /**
   * @param {string} name The name of the texture.
   * @param {Uint8Array} data The texture data.
   */
  constructor(name, data) {
    this.name = name;
    this.data = data;
    this.texture_ = null;
  }
  /**
   * @param {WebGLRenderingContext} gl Rendering context.
   * @return {WebGLTexture} The texture.
   */
  getTexture(gl) {
    if (!this.texture_) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.data.length / 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
      this.texture_ = texture;
    }
    return this.texture_;
  }
  /**
   * @param {WebGLRenderingContext} gl Rendering context.
   */
  delete(gl) {
    if (this.texture_) {
      gl.deleteTexture(this.texture_);
    }
    this.texture_ = null;
  }
};
var PaletteTexture_default = PaletteTexture;

// ../../node_modules/ol/expr/gpu.js
function computeOperatorFunctionName(operator, context) {
  return `operator_${operator}_${Object.keys(context.functions).length}`;
}
function numberToGlsl(v) {
  const s = v.toString();
  return s.includes(".") ? s : s + ".0";
}
function arrayToGlsl(array) {
  if (array.length < 2 || array.length > 4) {
    throw new Error("`formatArray` can only output `vec2`, `vec3` or `vec4` arrays.");
  }
  return `vec${array.length}(${array.map(numberToGlsl).join(", ")})`;
}
function colorToGlsl(color) {
  const array = asArray(color);
  const alpha = array.length > 3 ? array[3] : 1;
  return arrayToGlsl([array[0] / 255, array[1] / 255, array[2] / 255, alpha]);
}
function sizeToGlsl(size) {
  const array = toSize(size);
  return arrayToGlsl(array);
}
var stringToFloatMap = {};
var stringToFloatCounter = 0;
function getStringNumberEquivalent(string) {
  if (!(string in stringToFloatMap)) {
    stringToFloatMap[string] = stringToFloatCounter++;
  }
  return stringToFloatMap[string];
}
function stringToGlsl(string) {
  return numberToGlsl(getStringNumberEquivalent(string));
}
function uniformNameForVariable(variableName) {
  return "u_var_" + variableName;
}
function newCompilationContext() {
  return {
    inFragmentShader: false,
    variables: {},
    properties: {},
    functions: {},
    bandCount: 0,
    featureId: false,
    geometryType: false
  };
}
var GET_BAND_VALUE_FUNC = "getBandValue";
var PALETTE_TEXTURE_ARRAY = "u_paletteTextures";
var FEATURE_ID_PROPERTY_NAME = "featureId";
var GEOMETRY_TYPE_PROPERTY_NAME = "geometryType";
function buildExpression(encoded, type, parsingContext, compilationContext) {
  const expression = parse(encoded, type, parsingContext);
  return compile(expression, type, compilationContext);
}
function createCompiler(output) {
  return (context, expression, type) => {
    const length = expression.args.length;
    const args = new Array(length);
    for (let i = 0; i < length; ++i) {
      args[i] = compile(expression.args[i], type, context);
    }
    return output(args, context);
  };
}
var compilers = {
  [Ops.Get]: (context, expression) => {
    const firstArg = (
      /** @type {LiteralExpression} */
      expression.args[0]
    );
    const propName = (
      /** @type {string} */
      firstArg.value
    );
    const isExisting = propName in context.properties;
    if (!isExisting) {
      context.properties[propName] = {
        name: propName,
        type: expression.type
      };
    }
    const prefix = context.inFragmentShader ? "v_prop_" : "a_prop_";
    return prefix + propName;
  },
  [Ops.Id]: (context) => {
    context.featureId = true;
    const prefix = context.inFragmentShader ? "v_" : "a_";
    return prefix + FEATURE_ID_PROPERTY_NAME;
  },
  [Ops.GeometryType]: (context) => {
    context.geometryType = true;
    const prefix = context.inFragmentShader ? "v_" : "a_";
    return prefix + GEOMETRY_TYPE_PROPERTY_NAME;
  },
  [Ops.LineMetric]: () => "currentLineMetric",
  // this variable is assumed to always be present in shaders, default is 0.
  [Ops.Var]: (context, expression) => {
    const firstArg = (
      /** @type {LiteralExpression} */
      expression.args[0]
    );
    const varName = (
      /** @type {string} */
      firstArg.value
    );
    const isExisting = varName in context.variables;
    if (!isExisting) {
      context.variables[varName] = {
        name: varName,
        type: expression.type
      };
    }
    return uniformNameForVariable(varName);
  },
  [Ops.Resolution]: () => "u_resolution",
  [Ops.Zoom]: () => "u_zoom",
  [Ops.Time]: () => "u_time",
  [Ops.Any]: createCompiler((compiledArgs) => `(${compiledArgs.join(` || `)})`),
  [Ops.All]: createCompiler((compiledArgs) => `(${compiledArgs.join(` && `)})`),
  [Ops.Not]: createCompiler(([value]) => `(!${value})`),
  [Ops.Equal]: createCompiler(([firstValue, secondValue]) => `(${firstValue} == ${secondValue})`),
  [Ops.NotEqual]: createCompiler(([firstValue, secondValue]) => `(${firstValue} != ${secondValue})`),
  [Ops.GreaterThan]: createCompiler(([firstValue, secondValue]) => `(${firstValue} > ${secondValue})`),
  [Ops.GreaterThanOrEqualTo]: createCompiler(([firstValue, secondValue]) => `(${firstValue} >= ${secondValue})`),
  [Ops.LessThan]: createCompiler(([firstValue, secondValue]) => `(${firstValue} < ${secondValue})`),
  [Ops.LessThanOrEqualTo]: createCompiler(([firstValue, secondValue]) => `(${firstValue} <= ${secondValue})`),
  [Ops.Multiply]: createCompiler((compiledArgs) => `(${compiledArgs.join(" * ")})`),
  [Ops.Divide]: createCompiler(([firstValue, secondValue]) => `(${firstValue} / ${secondValue})`),
  [Ops.Add]: createCompiler((compiledArgs) => `(${compiledArgs.join(" + ")})`),
  [Ops.Subtract]: createCompiler(([firstValue, secondValue]) => `(${firstValue} - ${secondValue})`),
  [Ops.Clamp]: createCompiler(([value, min, max]) => `clamp(${value}, ${min}, ${max})`),
  [Ops.Mod]: createCompiler(([value, modulo]) => `mod(${value}, ${modulo})`),
  [Ops.Pow]: createCompiler(([value, power]) => `pow(${value}, ${power})`),
  [Ops.Abs]: createCompiler(([value]) => `abs(${value})`),
  [Ops.Floor]: createCompiler(([value]) => `floor(${value})`),
  [Ops.Ceil]: createCompiler(([value]) => `ceil(${value})`),
  [Ops.Round]: createCompiler(([value]) => `floor(${value} + 0.5)`),
  [Ops.Sin]: createCompiler(([value]) => `sin(${value})`),
  [Ops.Cos]: createCompiler(([value]) => `cos(${value})`),
  [Ops.Atan]: createCompiler(([firstValue, secondValue]) => {
    return secondValue !== void 0 ? `atan(${firstValue}, ${secondValue})` : `atan(${firstValue})`;
  }),
  [Ops.Sqrt]: createCompiler(([value]) => `sqrt(${value})`),
  [Ops.Match]: createCompiler((compiledArgs) => {
    const input = compiledArgs[0];
    const fallback = compiledArgs[compiledArgs.length - 1];
    let result = null;
    for (let i = compiledArgs.length - 3; i >= 1; i -= 2) {
      const match = compiledArgs[i];
      const output = compiledArgs[i + 1];
      result = `(${input} == ${match} ? ${output} : ${result || fallback})`;
    }
    return result;
  }),
  [Ops.Between]: createCompiler(([value, min, max]) => `(${value} >= ${min} && ${value} <= ${max})`),
  [Ops.Interpolate]: createCompiler(([exponent, input, ...compiledArgs]) => {
    let result = "";
    for (let i = 0; i < compiledArgs.length - 2; i += 2) {
      const stop1 = compiledArgs[i];
      const output1 = result || compiledArgs[i + 1];
      const stop2 = compiledArgs[i + 2];
      const output2 = compiledArgs[i + 3];
      let ratio;
      if (exponent === numberToGlsl(1)) {
        ratio = `(${input} - ${stop1}) / (${stop2} - ${stop1})`;
      } else {
        ratio = `(pow(${exponent}, (${input} - ${stop1})) - 1.0) / (pow(${exponent}, (${stop2} - ${stop1})) - 1.0)`;
      }
      result = `mix(${output1}, ${output2}, clamp(${ratio}, 0.0, 1.0))`;
    }
    return result;
  }),
  [Ops.Case]: createCompiler((compiledArgs) => {
    const fallback = compiledArgs[compiledArgs.length - 1];
    let result = null;
    for (let i = compiledArgs.length - 3; i >= 0; i -= 2) {
      const condition = compiledArgs[i];
      const output = compiledArgs[i + 1];
      result = `(${condition} ? ${output} : ${result || fallback})`;
    }
    return result;
  }),
  [Ops.In]: createCompiler(([needle, ...haystack], context) => {
    const funcName = computeOperatorFunctionName("in", context);
    const tests = [];
    for (let i = 0; i < haystack.length; i += 1) {
      tests.push(`  if (inputValue == ${haystack[i]}) { return true; }`);
    }
    context.functions[funcName] = `bool ${funcName}(float inputValue) {
${tests.join("\n")}
  return false;
}`;
    return `${funcName}(${needle})`;
  }),
  [Ops.Array]: createCompiler((args) => `vec${args.length}(${args.join(", ")})`),
  [Ops.Color]: createCompiler((compiledArgs) => {
    if (compiledArgs.length === 1) {
      return `vec4(vec3(${compiledArgs[0]} / 255.0), 1.0)`;
    }
    if (compiledArgs.length === 2) {
      return `vec4(vec3(${compiledArgs[0]} / 255.0), ${compiledArgs[1]})`;
    }
    const rgb = compiledArgs.slice(0, 3).map((color) => `${color} / 255.0`);
    if (compiledArgs.length === 3) {
      return `vec4(${rgb.join(", ")}, 1.0)`;
    }
    const alpha = compiledArgs[3];
    return `vec4(${rgb.join(", ")}, ${alpha})`;
  }),
  [Ops.Band]: createCompiler(([band, xOffset, yOffset], context) => {
    if (!(GET_BAND_VALUE_FUNC in context.functions)) {
      let ifBlocks = "";
      const bandCount = context.bandCount || 1;
      for (let i = 0; i < bandCount; i++) {
        const colorIndex = Math.floor(i / 4);
        let bandIndex = i % 4;
        if (i === bandCount - 1 && bandIndex === 1) {
          bandIndex = 3;
        }
        const textureName = `${Uniforms2.TILE_TEXTURE_ARRAY}[${colorIndex}]`;
        ifBlocks += `  if (band == ${i + 1}.0) {
    return texture2D(${textureName}, v_textureCoord + vec2(dx, dy))[${bandIndex}];
  }
`;
      }
      context.functions[GET_BAND_VALUE_FUNC] = `float getBandValue(float band, float xOffset, float yOffset) {
  float dx = xOffset / ${Uniforms2.TEXTURE_PIXEL_WIDTH};
  float dy = yOffset / ${Uniforms2.TEXTURE_PIXEL_HEIGHT};
${ifBlocks}
}`;
    }
    return `${GET_BAND_VALUE_FUNC}(${band}, ${xOffset ?? "0.0"}, ${yOffset ?? "0.0"})`;
  }),
  [Ops.Palette]: (context, expression) => {
    const [index, ...colors] = expression.args;
    const numColors = colors.length;
    const palette = new Uint8Array(numColors * 4);
    for (let i = 0; i < colors.length; i++) {
      const parsedValue = (
        /** @type {string | Array<number>} */
        /** @type {LiteralExpression} */
        colors[i].value
      );
      const color = asArray(parsedValue);
      const offset = i * 4;
      palette[offset] = color[0];
      palette[offset + 1] = color[1];
      palette[offset + 2] = color[2];
      palette[offset + 3] = color[3] * 255;
    }
    if (!context.paletteTextures) {
      context.paletteTextures = [];
    }
    const paletteName = `${PALETTE_TEXTURE_ARRAY}[${context.paletteTextures.length}]`;
    const paletteTexture = new PaletteTexture_default(paletteName, palette);
    context.paletteTextures.push(paletteTexture);
    const compiledIndex = compile(index, NumberType, context);
    return `texture2D(${paletteName}, vec2((${compiledIndex} + 0.5) / ${numColors}.0, 0.5))`;
  }
  // TODO: unimplemented
  // Ops.Number
  // Ops.String
  // Ops.Coalesce
  // Ops.Concat
  // Ops.ToString
};
function compile(expression, returnType, context) {
  if (expression instanceof CallExpression) {
    const compiler = compilers[expression.operator];
    if (compiler === void 0) {
      throw new Error(`No compiler defined for this operator: ${JSON.stringify(expression.operator)}`);
    }
    return compiler(context, expression, returnType);
  }
  if ((expression.type & NumberType) > 0) {
    return numberToGlsl(
      /** @type {number} */
      expression.value
    );
  }
  if ((expression.type & BooleanType) > 0) {
    return expression.value.toString();
  }
  if ((expression.type & StringType) > 0) {
    return stringToGlsl(expression.value.toString());
  }
  if ((expression.type & ColorType) > 0) {
    return colorToGlsl(
      /** @type {Array<number> | string} */
      expression.value
    );
  }
  if ((expression.type & NumberArrayType) > 0) {
    return arrayToGlsl(
      /** @type {Array<number>} */
      expression.value
    );
  }
  if ((expression.type & SizeType) > 0) {
    return sizeToGlsl(
      /** @type {number|import('../size.js').Size} */
      expression.value
    );
  }
  throw new Error(`Unexpected expression ${expression.value} (expected type ${typeName(returnType)})`);
}

// ../../node_modules/ol/render/webgl/utils.js
var LINESTRING_ANGLE_COSINE_CUTOFF = 0.985;
function colorEncodeId(id, array) {
  array = array || [];
  const radix = 256;
  const divide = radix - 1;
  array[0] = Math.floor(id / radix / radix / radix) / divide;
  array[1] = Math.floor(id / radix / radix) % radix / divide;
  array[2] = Math.floor(id / radix) % radix / divide;
  array[3] = id % radix / divide;
  return array;
}
function colorDecodeId(color) {
  let id = 0;
  const radix = 256;
  const mult = radix - 1;
  id += Math.round(color[0] * radix * radix * radix * mult);
  id += Math.round(color[1] * radix * radix * mult);
  id += Math.round(color[2] * radix * mult);
  id += Math.round(color[3] * mult);
  return id;
}

// ../../node_modules/ol/style/flat.js
function createDefaultStyle() {
  return {
    "fill-color": "rgba(255,255,255,0.4)",
    "stroke-color": "#3399CC",
    "stroke-width": 1.25,
    "circle-radius": 5,
    "circle-fill-color": "rgba(255,255,255,0.4)",
    "circle-stroke-width": 1.25,
    "circle-stroke-color": "#3399CC"
  };
}

// ../../node_modules/ol/webgl/ShaderBuilder.js
var COMMON_HEADER = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform mat4 u_projectionMatrix;
uniform mat4 u_screenToWorldMatrix;
uniform vec2 u_viewportSizePx;
uniform float u_pixelRatio;
uniform float u_globalAlpha;
uniform float u_time;
uniform float u_zoom;
uniform float u_resolution;
uniform float u_rotation;
uniform vec4 u_renderExtent;
uniform vec2 u_patternOrigin;
uniform float u_depth;
uniform mediump int u_hitDetection;

const float PI = 3.141592653589793238;
const float TWO_PI = 2.0 * PI;
float currentLineMetric = 0.; // an actual value will be used in the stroke shaders
`;
var DEFAULT_STYLE = createDefaultStyle();
var ShaderBuilder = class {
  constructor() {
    this.uniforms_ = [];
    this.attributes_ = [];
    this.varyings_ = [];
    this.hasSymbol_ = false;
    this.symbolSizeExpression_ = `vec2(${numberToGlsl(DEFAULT_STYLE["circle-radius"])} + ${numberToGlsl(DEFAULT_STYLE["circle-stroke-width"] * 0.5)})`;
    this.symbolRotationExpression_ = "0.0";
    this.symbolOffsetExpression_ = "vec2(0.0)";
    this.symbolColorExpression_ = colorToGlsl(
      /** @type {string} */
      DEFAULT_STYLE["circle-fill-color"]
    );
    this.texCoordExpression_ = "vec4(0.0, 0.0, 1.0, 1.0)";
    this.discardExpression_ = "false";
    this.symbolRotateWithView_ = false;
    this.hasStroke_ = false;
    this.strokeWidthExpression_ = numberToGlsl(DEFAULT_STYLE["stroke-width"]);
    this.strokeColorExpression_ = colorToGlsl(
      /** @type {string} */
      DEFAULT_STYLE["stroke-color"]
    );
    this.strokeOffsetExpression_ = "0.";
    this.strokeCapExpression_ = stringToGlsl("round");
    this.strokeJoinExpression_ = stringToGlsl("round");
    this.strokeMiterLimitExpression_ = "10.";
    this.strokeDistanceFieldExpression_ = "-1000.";
    this.hasFill_ = false;
    this.fillColorExpression_ = colorToGlsl(
      /** @type {string} */
      DEFAULT_STYLE["fill-color"]
    );
    this.vertexShaderFunctions_ = [];
    this.fragmentShaderFunctions_ = [];
  }
  /**
   * Adds a uniform accessible in both fragment and vertex shaders.
   * The given name should include a type, such as `sampler2D u_texture`.
   * @param {string} name Uniform name
   * @return {ShaderBuilder} the builder object
   */
  addUniform(name) {
    this.uniforms_.push(name);
    return this;
  }
  /**
   * Adds an attribute accessible in the vertex shader, read from the geometry buffer.
   * The given name should include a type, such as `vec2 a_position`.
   * @param {string} name Attribute name
   * @return {ShaderBuilder} the builder object
   */
  addAttribute(name) {
    this.attributes_.push(name);
    return this;
  }
  /**
   * Adds a varying defined in the vertex shader and accessible from the fragment shader.
   * The type and expression of the varying have to be specified separately.
   * @param {string} name Varying name
   * @param {'float'|'vec2'|'vec3'|'vec4'} type Type
   * @param {string} expression Expression used to assign a value to the varying.
   * @return {ShaderBuilder} the builder object
   */
  addVarying(name, type, expression) {
    this.varyings_.push({
      name,
      type,
      expression
    });
    return this;
  }
  /**
   * Sets an expression to compute the size of the shape.
   * This expression can use all the uniforms and attributes available
   * in the vertex shader, and should evaluate to a `vec2` value.
   * @param {string} expression Size expression
   * @return {ShaderBuilder} the builder object
   */
  setSymbolSizeExpression(expression) {
    this.hasSymbol_ = true;
    this.symbolSizeExpression_ = expression;
    return this;
  }
  /**
   * @return {string} The current symbol size expression
   */
  getSymbolSizeExpression() {
    return this.symbolSizeExpression_;
  }
  /**
   * Sets an expression to compute the rotation of the shape.
   * This expression can use all the uniforms and attributes available
   * in the vertex shader, and should evaluate to a `float` value in radians.
   * @param {string} expression Size expression
   * @return {ShaderBuilder} the builder object
   */
  setSymbolRotationExpression(expression) {
    this.symbolRotationExpression_ = expression;
    return this;
  }
  /**
   * Sets an expression to compute the offset of the symbol from the point center.
   * This expression can use all the uniforms and attributes available
   * in the vertex shader, and should evaluate to a `vec2` value.
   * @param {string} expression Offset expression
   * @return {ShaderBuilder} the builder object
   */
  setSymbolOffsetExpression(expression) {
    this.symbolOffsetExpression_ = expression;
    return this;
  }
  /**
   * @return {string} The current symbol offset expression
   */
  getSymbolOffsetExpression() {
    return this.symbolOffsetExpression_;
  }
  /**
   * Sets an expression to compute the color of the shape.
   * This expression can use all the uniforms, varyings and attributes available
   * in the fragment shader, and should evaluate to a `vec4` value.
   * @param {string} expression Color expression
   * @return {ShaderBuilder} the builder object
   */
  setSymbolColorExpression(expression) {
    this.hasSymbol_ = true;
    this.symbolColorExpression_ = expression;
    return this;
  }
  /**
   * @return {string} The current symbol color expression
   */
  getSymbolColorExpression() {
    return this.symbolColorExpression_;
  }
  /**
   * Sets an expression to compute the texture coordinates of the vertices.
   * This expression can use all the uniforms and attributes available
   * in the vertex shader, and should evaluate to a `vec4` value.
   * @param {string} expression Texture coordinate expression
   * @return {ShaderBuilder} the builder object
   */
  setTextureCoordinateExpression(expression) {
    this.texCoordExpression_ = expression;
    return this;
  }
  /**
   * Sets an expression to determine whether a fragment (pixel) should be discarded,
   * i.e. not drawn at all.
   * This expression can use all the uniforms, varyings and attributes available
   * in the fragment shader, and should evaluate to a `bool` value (it will be
   * used in an `if` statement)
   * @param {string} expression Fragment discard expression
   * @return {ShaderBuilder} the builder object
   */
  setFragmentDiscardExpression(expression) {
    this.discardExpression_ = expression;
    return this;
  }
  /**
   * @return {string} The current fragment discard expression
   */
  getFragmentDiscardExpression() {
    return this.discardExpression_;
  }
  /**
   * Sets whether the symbols should rotate with the view or stay aligned with the map.
   * Note: will only be used for point geometry shaders.
   * @param {boolean} rotateWithView Rotate with view
   * @return {ShaderBuilder} the builder object
   */
  setSymbolRotateWithView(rotateWithView) {
    this.symbolRotateWithView_ = rotateWithView;
    return this;
  }
  /**
   * @param {string} expression Stroke width expression, returning value in pixels
   * @return {ShaderBuilder} the builder object
   */
  setStrokeWidthExpression(expression) {
    this.hasStroke_ = true;
    this.strokeWidthExpression_ = expression;
    return this;
  }
  /**
   * @param {string} expression Stroke color expression, evaluate to `vec4`: can rely on currentLengthPx and currentRadiusPx
   * @return {ShaderBuilder} the builder object
   */
  setStrokeColorExpression(expression) {
    this.hasStroke_ = true;
    this.strokeColorExpression_ = expression;
    return this;
  }
  /**
   * @return {string} The current stroke color expression
   */
  getStrokeColorExpression() {
    return this.strokeColorExpression_;
  }
  /**
   * @param {string} expression Stroke color expression, evaluate to `float`
   * @return {ShaderBuilder} the builder object
   */
  setStrokeOffsetExpression(expression) {
    this.strokeOffsetExpression_ = expression;
    return this;
  }
  /**
   * @param {string} expression Stroke line cap expression, evaluate to `float`
   * @return {ShaderBuilder} the builder object
   */
  setStrokeCapExpression(expression) {
    this.strokeCapExpression_ = expression;
    return this;
  }
  /**
   * @param {string} expression Stroke line join expression, evaluate to `float`
   * @return {ShaderBuilder} the builder object
   */
  setStrokeJoinExpression(expression) {
    this.strokeJoinExpression_ = expression;
    return this;
  }
  /**
   * @param {string} expression Stroke miter limit expression, evaluate to `float`
   * @return {ShaderBuilder} the builder object
   */
  setStrokeMiterLimitExpression(expression) {
    this.strokeMiterLimitExpression_ = expression;
    return this;
  }
  /**
   * @param {string} expression Stroke distance field expression, evaluate to `float`
   * This can override the default distance field; can rely on currentLengthPx and currentRadiusPx
   * @return {ShaderBuilder} the builder object
   */
  setStrokeDistanceFieldExpression(expression) {
    this.strokeDistanceFieldExpression_ = expression;
    return this;
  }
  /**
   * @param {string} expression Fill color expression, evaluate to `vec4`
   * @return {ShaderBuilder} the builder object
   */
  setFillColorExpression(expression) {
    this.hasFill_ = true;
    this.fillColorExpression_ = expression;
    return this;
  }
  /**
   * @return {string} The current fill color expression
   */
  getFillColorExpression() {
    return this.fillColorExpression_;
  }
  addVertexShaderFunction(code) {
    if (this.vertexShaderFunctions_.includes(code)) {
      return;
    }
    this.vertexShaderFunctions_.push(code);
  }
  addFragmentShaderFunction(code) {
    if (this.fragmentShaderFunctions_.includes(code)) {
      return;
    }
    this.fragmentShaderFunctions_.push(code);
  }
  /**
   * Generates a symbol vertex shader from the builder parameters
   * @return {string|null} The full shader as a string; null if no size or color specified
   */
  getSymbolVertexShader() {
    if (!this.hasSymbol_) {
      return null;
    }
    return `${COMMON_HEADER}
${this.uniforms_.map(function(uniform) {
      return "uniform " + uniform + ";";
    }).join("\n")}
attribute vec2 a_position;
attribute float a_index;
attribute vec4 a_hitColor;
${this.attributes_.map(function(attribute) {
      return "attribute " + attribute + ";";
    }).join("\n")}
varying vec2 v_texCoord;
varying vec2 v_quadCoord;
varying vec4 v_hitColor;
varying vec2 v_centerPx;
varying float v_angle;
varying vec2 v_quadSizePx;
${this.varyings_.map(function(varying) {
      return "varying " + varying.type + " " + varying.name + ";";
    }).join("\n")}
${this.vertexShaderFunctions_.join("\n")}
vec2 pxToScreen(vec2 coordPx) {
  vec2 scaled = coordPx / u_viewportSizePx / 0.5;
  return scaled;
}

vec2 screenToPx(vec2 coordScreen) {
  return (coordScreen * 0.5 + 0.5) * u_viewportSizePx;
}

void main(void) {
  v_quadSizePx = ${this.symbolSizeExpression_};
  vec2 halfSizePx = v_quadSizePx * 0.5;
  vec2 centerOffsetPx = ${this.symbolOffsetExpression_};
  vec2 offsetPx = centerOffsetPx;
  if (a_index == 0.0) {
    offsetPx -= halfSizePx;
  } else if (a_index == 1.0) {
    offsetPx += halfSizePx * vec2(1., -1.);
  } else if (a_index == 2.0) {
    offsetPx += halfSizePx;
  } else {
    offsetPx += halfSizePx * vec2(-1., 1.);
  }
  float angle = ${this.symbolRotationExpression_};
  ${this.symbolRotateWithView_ ? "angle += u_rotation;" : ""}
  float c = cos(-angle);
  float s = sin(-angle);
  offsetPx = vec2(c * offsetPx.x - s * offsetPx.y, s * offsetPx.x + c * offsetPx.y);
  vec4 center = u_projectionMatrix * vec4(a_position, 0.0, 1.0);
  gl_Position = center + vec4(pxToScreen(offsetPx), u_depth, 0.);
  vec4 texCoord = ${this.texCoordExpression_};
  float u = a_index == 0.0 || a_index == 3.0 ? texCoord.s : texCoord.p;
  float v = a_index == 2.0 || a_index == 3.0 ? texCoord.t : texCoord.q;
  v_texCoord = vec2(u, v);
  v_hitColor = a_hitColor;
  v_angle = angle;
  c = cos(-v_angle);
  s = sin(-v_angle);
  centerOffsetPx = vec2(c * centerOffsetPx.x - s * centerOffsetPx.y, s * centerOffsetPx.x + c * centerOffsetPx.y); 
  v_centerPx = screenToPx(center.xy) + centerOffsetPx;
${this.varyings_.map(function(varying) {
      return "  " + varying.name + " = " + varying.expression + ";";
    }).join("\n")}
}`;
  }
  /**
   * Generates a symbol fragment shader from the builder parameters
   * @return {string|null} The full shader as a string; null if no size or color specified
   */
  getSymbolFragmentShader() {
    if (!this.hasSymbol_) {
      return null;
    }
    return `${COMMON_HEADER}
${this.uniforms_.map(function(uniform) {
      return "uniform " + uniform + ";";
    }).join("\n")}
varying vec2 v_texCoord;
varying vec4 v_hitColor;
varying vec2 v_centerPx;
varying float v_angle;
varying vec2 v_quadSizePx;
${this.varyings_.map(function(varying) {
      return "varying " + varying.type + " " + varying.name + ";";
    }).join("\n")}
${this.fragmentShaderFunctions_.join("\n")}

void main(void) {
  if (${this.discardExpression_}) { discard; }
  vec2 coordsPx = gl_FragCoord.xy / u_pixelRatio - v_centerPx; // relative to center
  float c = cos(v_angle);
  float s = sin(v_angle);
  coordsPx = vec2(c * coordsPx.x - s * coordsPx.y, s * coordsPx.x + c * coordsPx.y);
  gl_FragColor = ${this.symbolColorExpression_};
  gl_FragColor.rgb *= gl_FragColor.a;
  if (u_hitDetection > 0) {
    if (gl_FragColor.a < 0.05) { discard; };
    gl_FragColor = v_hitColor;
  }
}`;
  }
  /**
   * Generates a stroke vertex shader from the builder parameters
   * @return {string|null} The full shader as a string; null if no size or color specified
   */
  getStrokeVertexShader() {
    if (!this.hasStroke_) {
      return null;
    }
    return `${COMMON_HEADER}
${this.uniforms_.map(function(uniform) {
      return "uniform " + uniform + ";";
    }).join("\n")}
attribute vec2 a_segmentStart;
attribute vec2 a_segmentEnd;
attribute float a_measureStart;
attribute float a_measureEnd;
attribute float a_parameters;
attribute float a_distance;
attribute vec2 a_joinAngles;
attribute vec4 a_hitColor;
${this.attributes_.map(function(attribute) {
      return "attribute " + attribute + ";";
    }).join("\n")}
varying vec2 v_segmentStart;
varying vec2 v_segmentEnd;
varying float v_angleStart;
varying float v_angleEnd;
varying float v_width;
varying vec4 v_hitColor;
varying float v_distanceOffsetPx;
varying float v_measureStart;
varying float v_measureEnd;
${this.varyings_.map(function(varying) {
      return "varying " + varying.type + " " + varying.name + ";";
    }).join("\n")}
${this.vertexShaderFunctions_.join("\n")}
vec2 worldToPx(vec2 worldPos) {
  vec4 screenPos = u_projectionMatrix * vec4(worldPos, 0.0, 1.0);
  return (0.5 * screenPos.xy + 0.5) * u_viewportSizePx;
}

vec4 pxToScreen(vec2 pxPos) {
  vec2 screenPos = 2.0 * pxPos / u_viewportSizePx - 1.0;
  return vec4(screenPos, u_depth, 1.0);
}

bool isCap(float joinAngle) {
  return joinAngle < -0.1;
}

vec2 getJoinOffsetDirection(vec2 normalPx, float joinAngle) {
  float halfAngle = joinAngle / 2.0;
  float c = cos(halfAngle);
  float s = sin(halfAngle);
  vec2 angleBisectorNormal = vec2(s * normalPx.x + c * normalPx.y, -c * normalPx.x + s * normalPx.y);
  float length = 1.0 / s;
  return angleBisectorNormal * length;
}

vec2 getOffsetPoint(vec2 point, vec2 normal, float joinAngle, float offsetPx) {
  // if on a cap or the join angle is too high, offset the line along the segment normal
  if (cos(joinAngle) > 0.998 || isCap(joinAngle)) {
    return point - normal * offsetPx;
  }
  // offset is applied along the inverted normal (positive offset goes "right" relative to line direction)
  return point - getJoinOffsetDirection(normal, joinAngle) * offsetPx;
}

void main(void) {
  v_angleStart = a_joinAngles.x;
  v_angleEnd = a_joinAngles.y;
  float vertexNumber = floor(abs(a_parameters) / 10000. + 0.5);
  currentLineMetric = vertexNumber < 1.5 ? a_measureStart : a_measureEnd;
  // we're reading the fractional part while keeping the sign (so -4.12 gives -0.12, 3.45 gives 0.45)
  float angleTangentSum = fract(abs(a_parameters) / 10000.) * 10000. * sign(a_parameters);

  float lineWidth = ${this.strokeWidthExpression_};
  float lineOffsetPx = ${this.strokeOffsetExpression_};

  // compute segment start/end in px with offset
  vec2 segmentStartPx = worldToPx(a_segmentStart);
  vec2 segmentEndPx = worldToPx(a_segmentEnd);
  vec2 tangentPx = normalize(segmentEndPx - segmentStartPx);
  vec2 normalPx = vec2(-tangentPx.y, tangentPx.x);
  segmentStartPx = getOffsetPoint(segmentStartPx, normalPx, v_angleStart, lineOffsetPx),
  segmentEndPx = getOffsetPoint(segmentEndPx, normalPx, v_angleEnd, lineOffsetPx);
  
  // compute current vertex position
  float normalDir = vertexNumber < 0.5 || (vertexNumber > 1.5 && vertexNumber < 2.5) ? 1.0 : -1.0;
  float tangentDir = vertexNumber < 1.5 ? 1.0 : -1.0;
  float angle = vertexNumber < 1.5 ? v_angleStart : v_angleEnd;
  vec2 joinDirection;
  vec2 positionPx = vertexNumber < 1.5 ? segmentStartPx : segmentEndPx;
  // if angle is too high, do not make a proper join
  if (cos(angle) > ${LINESTRING_ANGLE_COSINE_CUTOFF} || isCap(angle)) {
    joinDirection = normalPx * normalDir - tangentPx * tangentDir;
  } else {
    joinDirection = getJoinOffsetDirection(normalPx * normalDir, angle);
  }
  positionPx = positionPx + joinDirection * (lineWidth * 0.5 + 1.); // adding 1 pixel for antialiasing
  gl_Position = pxToScreen(positionPx);

  v_segmentStart = segmentStartPx;
  v_segmentEnd = segmentEndPx;
  v_width = lineWidth;
  v_hitColor = a_hitColor;
  v_distanceOffsetPx = a_distance / u_resolution - (lineOffsetPx * angleTangentSum);
  v_measureStart = a_measureStart;
  v_measureEnd = a_measureEnd;
${this.varyings_.map(function(varying) {
      return "  " + varying.name + " = " + varying.expression + ";";
    }).join("\n")}
}`;
  }
  /**
   * Generates a stroke fragment shader from the builder parameters
   *
   * @return {string|null} The full shader as a string; null if no size or color specified
   */
  getStrokeFragmentShader() {
    if (!this.hasStroke_) {
      return null;
    }
    return `${COMMON_HEADER}
${this.uniforms_.map(function(uniform) {
      return "uniform " + uniform + ";";
    }).join("\n")}
varying vec2 v_segmentStart;
varying vec2 v_segmentEnd;
varying float v_angleStart;
varying float v_angleEnd;
varying float v_width;
varying vec4 v_hitColor;
varying float v_distanceOffsetPx;
varying float v_measureStart;
varying float v_measureEnd;
${this.varyings_.map(function(varying) {
      return "varying " + varying.type + " " + varying.name + ";";
    }).join("\n")}
${this.fragmentShaderFunctions_.join("\n")}

vec2 pxToWorld(vec2 pxPos) {
  vec2 screenPos = 2.0 * pxPos / u_viewportSizePx - 1.0;
  return (u_screenToWorldMatrix * vec4(screenPos, 0.0, 1.0)).xy;
}

bool isCap(float joinAngle) {
  return joinAngle < -0.1;
}

float segmentDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  vec2 tangent = normalize(end - start);
  vec2 normal = vec2(-tangent.y, tangent.x);
  vec2 startToPoint = point - start;
  return abs(dot(startToPoint, normal)) - width * 0.5;
}

float buttCapDistanceField(vec2 point, vec2 start, vec2 end) {
  vec2 startToPoint = point - start;
  vec2 tangent = normalize(end - start);
  return dot(startToPoint, -tangent);
}

float squareCapDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  return buttCapDistanceField(point, start, end) - width * 0.5;
}

float roundCapDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  float onSegment = max(0., 1000. * dot(point - start, end - start)); // this is very high when inside the segment
  return length(point - start) - width * 0.5 - onSegment;
}

float roundJoinDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  return roundCapDistanceField(point, start, end, width);
}

float bevelJoinField(vec2 point, vec2 start, vec2 end, float width, float joinAngle) {
  vec2 startToPoint = point - start;
  vec2 tangent = normalize(end - start);
  float c = cos(joinAngle * 0.5);
  float s = sin(joinAngle * 0.5);
  float direction = -sign(sin(joinAngle));
  vec2 bisector = vec2(c * tangent.x - s * tangent.y, s * tangent.x + c * tangent.y);
  float radius = width * 0.5 * s;
  return dot(startToPoint, bisector * direction) - radius;
}

float miterJoinDistanceField(vec2 point, vec2 start, vec2 end, float width, float joinAngle) {
  if (cos(joinAngle) > ${LINESTRING_ANGLE_COSINE_CUTOFF}) { // avoid risking a division by zero
    return bevelJoinField(point, start, end, width, joinAngle);
  }
  float miterLength = 1. / sin(joinAngle * 0.5);
  float miterLimit = ${this.strokeMiterLimitExpression_};
  if (miterLength > miterLimit) {
    return bevelJoinField(point, start, end, width, joinAngle);
  }
  return -1000.;
}

float capDistanceField(vec2 point, vec2 start, vec2 end, float width, float capType) {
   if (capType == ${stringToGlsl("butt")}) {
    return buttCapDistanceField(point, start, end);
  } else if (capType == ${stringToGlsl("square")}) {
    return squareCapDistanceField(point, start, end, width);
  }
  return roundCapDistanceField(point, start, end, width);
}

float joinDistanceField(vec2 point, vec2 start, vec2 end, float width, float joinAngle, float joinType) {
  if (joinType == ${stringToGlsl("bevel")}) {
    return bevelJoinField(point, start, end, width, joinAngle);
  } else if (joinType == ${stringToGlsl("miter")}) {
    return miterJoinDistanceField(point, start, end, width, joinAngle);
  }
  return roundJoinDistanceField(point, start, end, width);
}

float computeSegmentPointDistance(vec2 point, vec2 start, vec2 end, float width, float joinAngle, float capType, float joinType) {
  if (isCap(joinAngle)) {
    return capDistanceField(point, start, end, width, capType);
  }
  return joinDistanceField(point, start, end, width, joinAngle, joinType);
}

void main(void) {
  vec2 currentPoint = gl_FragCoord.xy / u_pixelRatio;
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  vec2 worldPos = pxToWorld(currentPoint);
  if (
    abs(u_renderExtent[0] - u_renderExtent[2]) > 0.0 && (
      worldPos[0] < u_renderExtent[0] ||
      worldPos[1] < u_renderExtent[1] ||
      worldPos[0] > u_renderExtent[2] ||
      worldPos[1] > u_renderExtent[3]
    )
  ) {
    discard;
  }
  #endif

  float segmentLength = length(v_segmentEnd - v_segmentStart);
  vec2 segmentTangent = (v_segmentEnd - v_segmentStart) / segmentLength;
  vec2 segmentNormal = vec2(-segmentTangent.y, segmentTangent.x);
  vec2 startToPoint = currentPoint - v_segmentStart;
  float lengthToPoint = max(0., min(dot(segmentTangent, startToPoint), segmentLength));
  float currentLengthPx = lengthToPoint + v_distanceOffsetPx; 
  float currentRadiusPx = abs(dot(segmentNormal, startToPoint));
  float currentRadiusRatio = dot(segmentNormal, startToPoint) * 2. / v_width;
  currentLineMetric = mix(v_measureStart, v_measureEnd, lengthToPoint / segmentLength);

  if (${this.discardExpression_}) { discard; }

  vec4 color = ${this.strokeColorExpression_};
  float capType = ${this.strokeCapExpression_};
  float joinType = ${this.strokeJoinExpression_};
  float segmentStartDistance = computeSegmentPointDistance(currentPoint, v_segmentStart, v_segmentEnd, v_width, v_angleStart, capType, joinType);
  float segmentEndDistance = computeSegmentPointDistance(currentPoint, v_segmentEnd, v_segmentStart, v_width, v_angleEnd, capType, joinType);
  float distance = max(
    segmentDistanceField(currentPoint, v_segmentStart, v_segmentEnd, v_width),
    max(segmentStartDistance, segmentEndDistance)
  );
  distance = max(distance, ${this.strokeDistanceFieldExpression_});
  color.a *= smoothstep(0.5, -0.5, distance);
  gl_FragColor = color;
  gl_FragColor.a *= u_globalAlpha;
  gl_FragColor.rgb *= gl_FragColor.a;
  if (u_hitDetection > 0) {
    if (gl_FragColor.a < 0.1) { discard; };
    gl_FragColor = v_hitColor;
  }
}`;
  }
  /**
   * Generates a fill vertex shader from the builder parameters
   *
   * @return {string|null} The full shader as a string; null if no color specified
   */
  getFillVertexShader() {
    if (!this.hasFill_) {
      return null;
    }
    return `${COMMON_HEADER}
${this.uniforms_.map(function(uniform) {
      return "uniform " + uniform + ";";
    }).join("\n")}
attribute vec2 a_position;
attribute vec4 a_hitColor;
${this.attributes_.map(function(attribute) {
      return "attribute " + attribute + ";";
    }).join("\n")}
varying vec4 v_hitColor;
${this.varyings_.map(function(varying) {
      return "varying " + varying.type + " " + varying.name + ";";
    }).join("\n")}
${this.vertexShaderFunctions_.join("\n")}
void main(void) {
  gl_Position = u_projectionMatrix * vec4(a_position, u_depth, 1.0);
  v_hitColor = a_hitColor;
${this.varyings_.map(function(varying) {
      return "  " + varying.name + " = " + varying.expression + ";";
    }).join("\n")}
}`;
  }
  /**
   * Generates a fill fragment shader from the builder parameters
   * @return {string|null} The full shader as a string; null if no color specified
   */
  getFillFragmentShader() {
    if (!this.hasFill_) {
      return null;
    }
    return `${COMMON_HEADER}
${this.uniforms_.map(function(uniform) {
      return "uniform " + uniform + ";";
    }).join("\n")}
varying vec4 v_hitColor;
${this.varyings_.map(function(varying) {
      return "varying " + varying.type + " " + varying.name + ";";
    }).join("\n")}
${this.fragmentShaderFunctions_.join("\n")}
vec2 pxToWorld(vec2 pxPos) {
  vec2 screenPos = 2.0 * pxPos / u_viewportSizePx - 1.0;
  return (u_screenToWorldMatrix * vec4(screenPos, 0.0, 1.0)).xy;
}

vec2 worldToPx(vec2 worldPos) {
  vec4 screenPos = u_projectionMatrix * vec4(worldPos, 0.0, 1.0);
  return (0.5 * screenPos.xy + 0.5) * u_viewportSizePx;
}

void main(void) {
  vec2 pxPos = gl_FragCoord.xy / u_pixelRatio;
  vec2 pxOrigin = worldToPx(u_patternOrigin);
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  vec2 worldPos = pxToWorld(pxPos);
  if (
    abs(u_renderExtent[0] - u_renderExtent[2]) > 0.0 && (
      worldPos[0] < u_renderExtent[0] ||
      worldPos[1] < u_renderExtent[1] ||
      worldPos[0] > u_renderExtent[2] ||
      worldPos[1] > u_renderExtent[3]
    )
  ) {
    discard;
  }
  #endif
  if (${this.discardExpression_}) { discard; }
  gl_FragColor = ${this.fillColorExpression_};
  gl_FragColor.a *= u_globalAlpha;
  gl_FragColor.rgb *= gl_FragColor.a;
  if (u_hitDetection > 0) {
    if (gl_FragColor.a < 0.1) { discard; };
    gl_FragColor = v_hitColor;
  }
}`;
  }
};

// ../../node_modules/ol/webgl/styleparser.js
function expressionToGlsl(compilationContext, value, expectedType) {
  const parsingContext = newParsingContext();
  return buildExpression(value, expectedType, parsingContext, compilationContext);
}
function packColor(color) {
  const array = asArray(color);
  const r = array[0] * 256;
  const g = array[1];
  const b = array[2] * 256;
  const a = Math.round(array[3] * 255);
  return [r + g, b + a];
}
var UNPACK_COLOR_FN = `vec4 unpackColor(vec2 packedColor) {
  return vec4(
    fract(floor(packedColor[0] / 256.0) / 256.0),
    fract(packedColor[0] / 256.0),
    fract(floor(packedColor[1] / 256.0) / 256.0),
    fract(packedColor[1] / 256.0)
  );
}`;
function getGlslSizeFromType(type) {
  if (type === ColorType || type === SizeType) {
    return 2;
  }
  if (type === NumberArrayType) {
    return 4;
  }
  return 1;
}
function getGlslTypeFromType(type) {
  const size = getGlslSizeFromType(type);
  if (size > 1) {
    return (
      /** @type {'vec2'|'vec3'|'vec4'} */
      `vec${size}`
    );
  }
  return "float";
}
function computeHash(input) {
  const hash = JSON.stringify(input).split("").reduce((prev, curr) => (prev << 5) - prev + curr.charCodeAt(0), 0);
  return (hash >>> 0).toString();
}
function parseCommonSymbolProperties(style, builder, vertContext, prefix) {
  if (`${prefix}radius` in style && prefix !== "icon-") {
    let radius = expressionToGlsl(vertContext, style[`${prefix}radius`], NumberType);
    if (`${prefix}radius2` in style) {
      const radius2 = expressionToGlsl(vertContext, style[`${prefix}radius2`], NumberType);
      radius = `max(${radius}, ${radius2})`;
    }
    if (`${prefix}stroke-width` in style) {
      radius = `(${radius} + ${expressionToGlsl(vertContext, style[`${prefix}stroke-width`], NumberType)} * 0.5)`;
    }
    builder.setSymbolSizeExpression(`vec2(${radius} * 2. + 0.5)`);
  }
  if (`${prefix}scale` in style) {
    const scale2 = expressionToGlsl(vertContext, style[`${prefix}scale`], SizeType);
    builder.setSymbolSizeExpression(`${builder.getSymbolSizeExpression()} * ${scale2}`);
  }
  if (`${prefix}displacement` in style) {
    builder.setSymbolOffsetExpression(expressionToGlsl(vertContext, style[`${prefix}displacement`], NumberArrayType));
  }
  if (`${prefix}rotation` in style) {
    builder.setSymbolRotationExpression(expressionToGlsl(vertContext, style[`${prefix}rotation`], NumberType));
  }
  if (`${prefix}rotate-with-view` in style) {
    builder.setSymbolRotateWithView(!!style[`${prefix}rotate-with-view`]);
  }
}
function getColorFromDistanceField(distanceField, fillColor, strokeColor, strokeWidth, opacity) {
  let color = "vec4(0.)";
  if (fillColor !== null) {
    color = fillColor;
  }
  if (strokeColor !== null && strokeWidth !== null) {
    const strokeFillRatio = `smoothstep(-${strokeWidth} + 0.63, -${strokeWidth} - 0.58, ${distanceField})`;
    color = `mix(${strokeColor}, ${color}, ${strokeFillRatio})`;
  }
  const shapeOpacity = `(1.0 - smoothstep(-0.63, 0.58, ${distanceField}))`;
  let result = `${color} * vec4(1.0, 1.0, 1.0, ${shapeOpacity})`;
  if (opacity !== null) {
    result = `${result} * vec4(1.0, 1.0, 1.0, ${opacity})`;
  }
  return result;
}
function parseImageProperties(style, builder, uniforms, prefix, textureId) {
  const image = new Image();
  image.crossOrigin = style[`${prefix}cross-origin`] === void 0 ? "anonymous" : style[`${prefix}cross-origin`];
  image.src = style[`${prefix}src`];
  uniforms[`u_texture${textureId}_size`] = () => {
    return image.complete ? [image.width, image.height] : [0, 0];
  };
  builder.addUniform(`vec2 u_texture${textureId}_size`);
  const size = `u_texture${textureId}_size`;
  uniforms[`u_texture${textureId}`] = image;
  builder.addUniform(`sampler2D u_texture${textureId}`);
  return size;
}
function parseImageOffsetProperties(style, prefix, context, imageSize, sampleSize) {
  let offsetExpression = expressionToGlsl(context, style[`${prefix}offset`], NumberArrayType);
  if (`${prefix}offset-origin` in style) {
    switch (style[`${prefix}offset-origin`]) {
      case "top-right":
        offsetExpression = `vec2(${imageSize}.x, 0.) + ${sampleSize} * vec2(-1., 0.) + ${offsetExpression} * vec2(-1., 1.)`;
        break;
      case "bottom-left":
        offsetExpression = `vec2(0., ${imageSize}.y) + ${sampleSize} * vec2(0., -1.) + ${offsetExpression} * vec2(1., -1.)`;
        break;
      case "bottom-right":
        offsetExpression = `${imageSize} - ${sampleSize} - ${offsetExpression}`;
        break;
      default:
    }
  }
  return offsetExpression;
}
function parseCircleProperties(style, builder, uniforms, vertContext, fragContext) {
  fragContext.functions["circleDistanceField"] = `float circleDistanceField(vec2 point, float radius) {
  return length(point) - radius;
}`;
  parseCommonSymbolProperties(style, builder, vertContext, "circle-");
  let opacity = null;
  if ("circle-opacity" in style) {
    opacity = expressionToGlsl(fragContext, style["circle-opacity"], NumberType);
  }
  let currentPoint = "coordsPx";
  if ("circle-scale" in style) {
    const scale2 = expressionToGlsl(fragContext, style["circle-scale"], SizeType);
    currentPoint = `coordsPx / ${scale2}`;
  }
  let fillColor = null;
  if ("circle-fill-color" in style) {
    fillColor = expressionToGlsl(fragContext, style["circle-fill-color"], ColorType);
  }
  let strokeColor = null;
  if ("circle-stroke-color" in style) {
    strokeColor = expressionToGlsl(fragContext, style["circle-stroke-color"], ColorType);
  }
  let radius = expressionToGlsl(fragContext, style["circle-radius"], NumberType);
  let strokeWidth = null;
  if ("circle-stroke-width" in style) {
    strokeWidth = expressionToGlsl(fragContext, style["circle-stroke-width"], NumberType);
    radius = `(${radius} + ${strokeWidth} * 0.5)`;
  }
  const distanceField = `circleDistanceField(${currentPoint}, ${radius})`;
  const colorExpression = getColorFromDistanceField(distanceField, fillColor, strokeColor, strokeWidth, opacity);
  builder.setSymbolColorExpression(colorExpression);
}
function parseShapeProperties(style, builder, uniforms, vertContext, fragContext) {
  fragContext.functions["round"] = `float round(float v) {
  return sign(v) * floor(abs(v) + 0.5);
}`;
  fragContext.functions["starDistanceField"] = `float starDistanceField(vec2 point, float numPoints, float radius, float radius2, float angle) {
  float startAngle = -PI * 0.5 + angle; // tip starts upwards and rotates clockwise with angle
  float c = cos(startAngle);
  float s = sin(startAngle);
  vec2 pointRotated = vec2(c * point.x - s * point.y, s * point.x + c * point.y);
  float alpha = TWO_PI / numPoints; // the angle of one sector
  float beta = atan(pointRotated.y, pointRotated.x);
  float gamma = round(beta / alpha) * alpha; // angle in sector
  c = cos(-gamma);
  s = sin(-gamma);
  vec2 inSector = vec2(c * pointRotated.x - s * pointRotated.y, abs(s * pointRotated.x + c * pointRotated.y));
  vec2 tipToPoint = inSector + vec2(-radius, 0.);
  vec2 edgeNormal = vec2(radius2 * sin(alpha * 0.5), -radius2 * cos(alpha * 0.5) + radius);
  return dot(normalize(edgeNormal), tipToPoint);
}`;
  fragContext.functions["regularDistanceField"] = `float regularDistanceField(vec2 point, float numPoints, float radius, float angle) {
  float startAngle = -PI * 0.5 + angle; // tip starts upwards and rotates clockwise with angle
  float c = cos(startAngle);
  float s = sin(startAngle);
  vec2 pointRotated = vec2(c * point.x - s * point.y, s * point.x + c * point.y);
  float alpha = TWO_PI / numPoints; // the angle of one sector
  float radiusIn = radius * cos(PI / numPoints);
  float beta = atan(pointRotated.y, pointRotated.x);
  float gamma = round((beta - alpha * 0.5) / alpha) * alpha + alpha * 0.5; // angle in sector from mid
  c = cos(-gamma);
  s = sin(-gamma);
  vec2 inSector = vec2(c * pointRotated.x - s * pointRotated.y, abs(s * pointRotated.x + c * pointRotated.y));
  return inSector.x - radiusIn;
}`;
  parseCommonSymbolProperties(style, builder, vertContext, "shape-");
  let opacity = null;
  if ("shape-opacity" in style) {
    opacity = expressionToGlsl(fragContext, style["shape-opacity"], NumberType);
  }
  let currentPoint = "coordsPx";
  if ("shape-scale" in style) {
    const scale2 = expressionToGlsl(fragContext, style["shape-scale"], SizeType);
    currentPoint = `coordsPx / ${scale2}`;
  }
  let fillColor = null;
  if ("shape-fill-color" in style) {
    fillColor = expressionToGlsl(fragContext, style["shape-fill-color"], ColorType);
  }
  let strokeColor = null;
  if ("shape-stroke-color" in style) {
    strokeColor = expressionToGlsl(fragContext, style["shape-stroke-color"], ColorType);
  }
  let strokeWidth = null;
  if ("shape-stroke-width" in style) {
    strokeWidth = expressionToGlsl(fragContext, style["shape-stroke-width"], NumberType);
  }
  const numPoints = expressionToGlsl(fragContext, style["shape-points"], NumberType);
  let angle = "0.";
  if ("shape-angle" in style) {
    angle = expressionToGlsl(fragContext, style["shape-angle"], NumberType);
  }
  let shapeField;
  let radius = expressionToGlsl(fragContext, style["shape-radius"], NumberType);
  if (strokeWidth !== null) {
    radius = `${radius} + ${strokeWidth} * 0.5`;
  }
  if ("shape-radius2" in style) {
    let radius2 = expressionToGlsl(fragContext, style["shape-radius2"], NumberType);
    if (strokeWidth !== null) {
      radius2 = `${radius2} + ${strokeWidth} * 0.5`;
    }
    shapeField = `starDistanceField(${currentPoint}, ${numPoints}, ${radius}, ${radius2}, ${angle})`;
  } else {
    shapeField = `regularDistanceField(${currentPoint}, ${numPoints}, ${radius}, ${angle})`;
  }
  const colorExpression = getColorFromDistanceField(shapeField, fillColor, strokeColor, strokeWidth, opacity);
  builder.setSymbolColorExpression(colorExpression);
}
function parseIconProperties(style, builder, uniforms, vertContext, fragContext) {
  let color = "vec4(1.0)";
  if ("icon-color" in style) {
    color = expressionToGlsl(fragContext, style["icon-color"], ColorType);
  }
  if ("icon-opacity" in style) {
    color = `${color} * vec4(1.0, 1.0, 1.0, ${expressionToGlsl(fragContext, style["icon-opacity"], NumberType)})`;
  }
  const textureId = computeHash(style["icon-src"]);
  const sizeExpression = parseImageProperties(style, builder, uniforms, "icon-", textureId);
  builder.setSymbolColorExpression(`${color} * texture2D(u_texture${textureId}, v_texCoord)`).setSymbolSizeExpression(sizeExpression);
  if ("icon-width" in style && "icon-height" in style) {
    builder.setSymbolSizeExpression(`vec2(${expressionToGlsl(vertContext, style["icon-width"], NumberType)}, ${expressionToGlsl(vertContext, style["icon-height"], NumberType)})`);
  }
  if ("icon-offset" in style && "icon-size" in style) {
    const sampleSize = expressionToGlsl(vertContext, style["icon-size"], NumberArrayType);
    const fullsize = builder.getSymbolSizeExpression();
    builder.setSymbolSizeExpression(sampleSize);
    const offset = parseImageOffsetProperties(style, "icon-", vertContext, "v_quadSizePx", sampleSize);
    builder.setTextureCoordinateExpression(`(vec4((${offset}).xyxy) + vec4(0., 0., ${sampleSize})) / (${fullsize}).xyxy`);
  }
  parseCommonSymbolProperties(style, builder, vertContext, "icon-");
  if ("icon-anchor" in style) {
    const anchor = expressionToGlsl(vertContext, style["icon-anchor"], NumberArrayType);
    let scale2 = `1.0`;
    if (`icon-scale` in style) {
      scale2 = expressionToGlsl(vertContext, style[`icon-scale`], SizeType);
    }
    let shiftPx;
    if (style["icon-anchor-x-units"] === "pixels" && style["icon-anchor-y-units"] === "pixels") {
      shiftPx = `${anchor} * ${scale2}`;
    } else if (style["icon-anchor-x-units"] === "pixels") {
      shiftPx = `${anchor} * vec2(vec2(${scale2}).x, v_quadSizePx.y)`;
    } else if (style["icon-anchor-y-units"] === "pixels") {
      shiftPx = `${anchor} * vec2(v_quadSizePx.x, vec2(${scale2}).x)`;
    } else {
      shiftPx = `${anchor} * v_quadSizePx`;
    }
    let offsetPx = `v_quadSizePx * vec2(0.5, -0.5) + ${shiftPx} * vec2(-1., 1.)`;
    if ("icon-anchor-origin" in style) {
      switch (style["icon-anchor-origin"]) {
        case "top-right":
          offsetPx = `v_quadSizePx * -0.5 + ${shiftPx}`;
          break;
        case "bottom-left":
          offsetPx = `v_quadSizePx * 0.5 - ${shiftPx}`;
          break;
        case "bottom-right":
          offsetPx = `v_quadSizePx * vec2(-0.5, 0.5) + ${shiftPx} * vec2(1., -1.)`;
          break;
        default:
      }
    }
    builder.setSymbolOffsetExpression(`${builder.getSymbolOffsetExpression()} + ${offsetPx}`);
  }
}
function parseStrokeProperties(style, builder, uniforms, vertContext, fragContext) {
  if ("stroke-color" in style) {
    builder.setStrokeColorExpression(expressionToGlsl(fragContext, style["stroke-color"], ColorType));
  }
  if ("stroke-pattern-src" in style) {
    const textureId = computeHash(style["stroke-pattern-src"]);
    const sizeExpression = parseImageProperties(style, builder, uniforms, "stroke-pattern-", textureId);
    let sampleSizeExpression = sizeExpression;
    let offsetExpression = "vec2(0.)";
    if ("stroke-pattern-offset" in style && "stroke-pattern-size" in style) {
      sampleSizeExpression = expressionToGlsl(fragContext, style[`stroke-pattern-size`], NumberArrayType);
      offsetExpression = parseImageOffsetProperties(style, "stroke-pattern-", fragContext, sizeExpression, sampleSizeExpression);
    }
    let spacingExpression = "0.";
    if ("stroke-pattern-spacing" in style) {
      spacingExpression = expressionToGlsl(fragContext, style["stroke-pattern-spacing"], NumberType);
    }
    fragContext.functions["sampleStrokePattern"] = `vec4 sampleStrokePattern(sampler2D texture, vec2 textureSize, vec2 textureOffset, vec2 sampleSize, float spacingPx, float currentLengthPx, float currentRadiusRatio, float lineWidth) {
  float currentLengthScaled = currentLengthPx * sampleSize.y / lineWidth;
  float spacingScaled = spacingPx * sampleSize.y / lineWidth;
  float uCoordPx = mod(currentLengthScaled, (sampleSize.x + spacingScaled));
  // make sure that we're not sampling too close to the borders to avoid interpolation with outside pixels
  uCoordPx = clamp(uCoordPx, 0.5, sampleSize.x - 0.5);
  float vCoordPx = (-currentRadiusRatio * 0.5 + 0.5) * sampleSize.y;
  vec2 texCoord = (vec2(uCoordPx, vCoordPx) + textureOffset) / textureSize;
  return texture2D(texture, texCoord);
}`;
    const textureName = `u_texture${textureId}`;
    let tintExpression = "1.";
    if ("stroke-color" in style) {
      tintExpression = builder.getStrokeColorExpression();
    }
    builder.setStrokeColorExpression(`${tintExpression} * sampleStrokePattern(${textureName}, ${sizeExpression}, ${offsetExpression}, ${sampleSizeExpression}, ${spacingExpression}, currentLengthPx, currentRadiusRatio, v_width)`);
  }
  if ("stroke-width" in style) {
    builder.setStrokeWidthExpression(expressionToGlsl(vertContext, style["stroke-width"], NumberType));
  }
  if ("stroke-offset" in style) {
    builder.setStrokeOffsetExpression(expressionToGlsl(vertContext, style["stroke-offset"], NumberType));
  }
  if ("stroke-line-cap" in style) {
    builder.setStrokeCapExpression(expressionToGlsl(vertContext, style["stroke-line-cap"], StringType));
  }
  if ("stroke-line-join" in style) {
    builder.setStrokeJoinExpression(expressionToGlsl(vertContext, style["stroke-line-join"], StringType));
  }
  if ("stroke-miter-limit" in style) {
    builder.setStrokeMiterLimitExpression(expressionToGlsl(vertContext, style["stroke-miter-limit"], NumberType));
  }
  if ("stroke-line-dash" in style) {
    fragContext.functions["getSingleDashDistance"] = `float getSingleDashDistance(float distance, float radius, float dashOffset, float dashLength, float dashLengthTotal, float capType) {
  float localDistance = mod(distance, dashLengthTotal);
  float distanceSegment = abs(localDistance - dashOffset - dashLength * 0.5) - dashLength * 0.5;
  distanceSegment = min(distanceSegment, dashLengthTotal - localDistance);
  if (capType == ${stringToGlsl("square")}) {
    distanceSegment -= v_width * 0.5;
  } else if (capType == ${stringToGlsl("round")}) {
    distanceSegment = min(distanceSegment, sqrt(distanceSegment * distanceSegment + radius * radius) - v_width * 0.5);
  }
  return distanceSegment;
}`;
    let dashPattern = style["stroke-line-dash"].map((v) => expressionToGlsl(fragContext, v, NumberType));
    if (dashPattern.length % 2 === 1) {
      dashPattern = [...dashPattern, ...dashPattern];
    }
    let offsetExpression = "0.";
    if ("stroke-line-dash-offset" in style) {
      offsetExpression = expressionToGlsl(vertContext, style["stroke-line-dash-offset"], NumberType);
    }
    const uniqueDashKey = computeHash(style["stroke-line-dash"]);
    const dashFunctionName = `dashDistanceField_${uniqueDashKey}`;
    const dashLengthsDef = dashPattern.map((v, i) => `float dashLength${i} = ${v};`);
    const totalLengthDef = dashPattern.map((v, i) => `dashLength${i}`).join(" + ");
    let currentDashOffset = "0.";
    let distanceExpression = `getSingleDashDistance(distance, radius, ${currentDashOffset}, dashLength0, totalDashLength, capType)`;
    for (let i = 2; i < dashPattern.length; i += 2) {
      currentDashOffset = `${currentDashOffset} + dashLength${i - 2} + dashLength${i - 1}`;
      distanceExpression = `min(${distanceExpression}, getSingleDashDistance(distance, radius, ${currentDashOffset}, dashLength${i}, totalDashLength, capType))`;
    }
    fragContext.functions[dashFunctionName] = `float ${dashFunctionName}(float distance, float radius, float capType) {
  ${dashLengthsDef.join("\n  ")}
  float totalDashLength = ${totalLengthDef};
  return ${distanceExpression};
}`;
    builder.setStrokeDistanceFieldExpression(`${dashFunctionName}(currentLengthPx + ${offsetExpression}, currentRadiusPx, capType)`);
  }
}
function parseFillProperties(style, builder, uniforms, vertContext, fragContext) {
  if ("fill-color" in style) {
    builder.setFillColorExpression(expressionToGlsl(fragContext, style["fill-color"], ColorType));
  }
  if ("fill-pattern-src" in style) {
    const textureId = computeHash(style["fill-pattern-src"]);
    const sizeExpression = parseImageProperties(style, builder, uniforms, "fill-pattern-", textureId);
    let sampleSizeExpression = sizeExpression;
    let offsetExpression = "vec2(0.)";
    if ("fill-pattern-offset" in style && "fill-pattern-size" in style) {
      sampleSizeExpression = expressionToGlsl(fragContext, style[`fill-pattern-size`], NumberArrayType);
      offsetExpression = parseImageOffsetProperties(style, "fill-pattern-", fragContext, sizeExpression, sampleSizeExpression);
    }
    fragContext.functions["sampleFillPattern"] = `vec4 sampleFillPattern(sampler2D texture, vec2 textureSize, vec2 textureOffset, vec2 sampleSize, vec2 pxOrigin, vec2 pxPosition) {
  float scaleRatio = pow(2., mod(u_zoom + 0.5, 1.) - 0.5);
  vec2 pxRelativePos = pxPosition - pxOrigin;
  // rotate the relative position from origin by the current view rotation
  pxRelativePos = vec2(pxRelativePos.x * cos(u_rotation) - pxRelativePos.y * sin(u_rotation), pxRelativePos.x * sin(u_rotation) + pxRelativePos.y * cos(u_rotation));
  // sample position is computed according to the sample offset & size
  vec2 samplePos = mod(pxRelativePos / scaleRatio, sampleSize);
  // also make sure that we're not sampling too close to the borders to avoid interpolation with outside pixels
  samplePos = clamp(samplePos, vec2(0.5), sampleSize - vec2(0.5));
  samplePos.y = sampleSize.y - samplePos.y; // invert y axis so that images appear upright
  return texture2D(texture, (samplePos + textureOffset) / textureSize);
}`;
    const textureName = `u_texture${textureId}`;
    let tintExpression = "1.";
    if ("fill-color" in style) {
      tintExpression = builder.getFillColorExpression();
    }
    builder.setFillColorExpression(`${tintExpression} * sampleFillPattern(${textureName}, ${sizeExpression}, ${offsetExpression}, ${sampleSizeExpression}, pxOrigin, pxPos)`);
  }
}
function parseLiteralStyle(style, variables) {
  const vertContext = newCompilationContext();
  const fragContext = __spreadProps(__spreadValues({}, newCompilationContext()), {
    inFragmentShader: true,
    variables: vertContext.variables
  });
  const builder = new ShaderBuilder();
  const uniforms = {};
  if ("icon-src" in style) {
    parseIconProperties(style, builder, uniforms, vertContext, fragContext);
  } else if ("shape-points" in style) {
    parseShapeProperties(style, builder, uniforms, vertContext, fragContext);
  } else if ("circle-radius" in style) {
    parseCircleProperties(style, builder, uniforms, vertContext, fragContext);
  }
  parseStrokeProperties(style, builder, uniforms, vertContext, fragContext);
  parseFillProperties(style, builder, uniforms, vertContext, fragContext);
  if (style.filter) {
    const parsedFilter = expressionToGlsl(fragContext, style.filter, BooleanType);
    builder.setFragmentDiscardExpression(`!${parsedFilter}`);
  }
  for (const varName in fragContext.variables) {
    const variable = fragContext.variables[varName];
    const uniformName = uniformNameForVariable(variable.name);
    let glslType = getGlslTypeFromType(variable.type);
    if (variable.type === ColorType) {
      glslType = "vec4";
    }
    builder.addUniform(`${glslType} ${uniformName}`);
    uniforms[uniformName] = () => {
      const value = variables[variable.name];
      if (typeof value === "number") {
        return value;
      }
      if (typeof value === "boolean") {
        return value ? 1 : 0;
      }
      if (variable.type === ColorType) {
        return asArray(value || "#eee");
      }
      if (typeof value === "string") {
        return getStringNumberEquivalent(value);
      }
      return value;
    };
  }
  for (const propName in fragContext.properties) {
    const property = fragContext.properties[propName];
    if (!vertContext.properties[propName]) {
      vertContext.properties[propName] = property;
    }
    let type = getGlslTypeFromType(property.type);
    let expression = `a_prop_${property.name}`;
    if (property.type === ColorType) {
      type = "vec4";
      expression = `unpackColor(${expression})`;
      builder.addVertexShaderFunction(UNPACK_COLOR_FN);
    }
    builder.addVarying(`v_prop_${property.name}`, type, expression);
  }
  for (const propName in vertContext.properties) {
    const property = vertContext.properties[propName];
    builder.addAttribute(`${getGlslTypeFromType(property.type)} a_prop_${property.name}`);
  }
  for (const functionName in vertContext.functions) {
    builder.addVertexShaderFunction(vertContext.functions[functionName]);
  }
  for (const functionName in fragContext.functions) {
    builder.addFragmentShaderFunction(fragContext.functions[functionName]);
  }
  const attributes = {};
  for (const propName in vertContext.properties) {
    const property = vertContext.properties[propName];
    const callback = (feature) => {
      const value = feature.get(property.name);
      if (property.type === ColorType) {
        return packColor([...asArray(value || "#eee")]);
      }
      if (typeof value === "string") {
        return getStringNumberEquivalent(value);
      }
      if (typeof value === "boolean") {
        return value ? 1 : 0;
      }
      return value;
    };
    attributes[`prop_${property.name}`] = {
      size: getGlslSizeFromType(property.type),
      callback
    };
  }
  function defineSpecialInput(contextPropName, glslPropName, type, callback) {
    const inVertContext = vertContext[contextPropName];
    const inFragContext = fragContext[contextPropName];
    if (!inVertContext && !inFragContext) {
      return;
    }
    const glslType = getGlslTypeFromType(type);
    const attrSize = getGlslSizeFromType(type);
    builder.addAttribute(`${glslType} a_${glslPropName}`);
    if (inFragContext) {
      builder.addVarying(`v_${glslPropName}`, glslType, `a_${glslPropName}`);
    }
    attributes[glslPropName] = {
      size: attrSize,
      callback
    };
  }
  defineSpecialInput("geometryType", GEOMETRY_TYPE_PROPERTY_NAME, StringType, (feature) => getStringNumberEquivalent(computeGeometryType(feature.getGeometry())));
  defineSpecialInput("featureId", FEATURE_ID_PROPERTY_NAME, StringType | NumberType, (feature) => {
    const id = feature.getId() ?? null;
    return typeof id === "string" ? getStringNumberEquivalent(id) : id;
  });
  return {
    builder,
    attributes,
    uniforms
  };
}

// ../../node_modules/ol/layer/WebGLTile.js
function parseStyle(style, bandCount) {
  const vertexShader = `
    attribute vec2 ${Attributes.TEXTURE_COORD};
    uniform mat4 ${Uniforms2.TILE_TRANSFORM};
    uniform float ${Uniforms2.TEXTURE_PIXEL_WIDTH};
    uniform float ${Uniforms2.TEXTURE_PIXEL_HEIGHT};
    uniform float ${Uniforms2.TEXTURE_RESOLUTION};
    uniform float ${Uniforms2.TEXTURE_ORIGIN_X};
    uniform float ${Uniforms2.TEXTURE_ORIGIN_Y};
    uniform float ${Uniforms2.DEPTH};

    varying vec2 v_textureCoord;
    varying vec2 v_mapCoord;

    void main() {
      v_textureCoord = ${Attributes.TEXTURE_COORD};
      v_mapCoord = vec2(
        ${Uniforms2.TEXTURE_ORIGIN_X} + ${Uniforms2.TEXTURE_RESOLUTION} * ${Uniforms2.TEXTURE_PIXEL_WIDTH} * v_textureCoord[0],
        ${Uniforms2.TEXTURE_ORIGIN_Y} - ${Uniforms2.TEXTURE_RESOLUTION} * ${Uniforms2.TEXTURE_PIXEL_HEIGHT} * v_textureCoord[1]
      );
      gl_Position = ${Uniforms2.TILE_TRANSFORM} * vec4(${Attributes.TEXTURE_COORD}, ${Uniforms2.DEPTH}, 1.0);
    }
  `;
  const context = __spreadProps(__spreadValues({}, newCompilationContext()), {
    inFragmentShader: true,
    bandCount
  });
  const pipeline = [];
  if (style.color !== void 0) {
    const color = expressionToGlsl(context, style.color, ColorType);
    pipeline.push(`color = ${color};`);
  }
  if (style.contrast !== void 0) {
    const contrast = expressionToGlsl(context, style.contrast, NumberType);
    pipeline.push(`color.rgb = clamp((${contrast} + 1.0) * color.rgb - (${contrast} / 2.0), vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));`);
  }
  if (style.exposure !== void 0) {
    const exposure = expressionToGlsl(context, style.exposure, NumberType);
    pipeline.push(`color.rgb = clamp((${exposure} + 1.0) * color.rgb, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));`);
  }
  if (style.saturation !== void 0) {
    const saturation = expressionToGlsl(context, style.saturation, NumberType);
    pipeline.push(`
      float saturation = ${saturation} + 1.0;
      float sr = (1.0 - saturation) * 0.2126;
      float sg = (1.0 - saturation) * 0.7152;
      float sb = (1.0 - saturation) * 0.0722;
      mat3 saturationMatrix = mat3(
        sr + saturation, sr, sr,
        sg, sg + saturation, sg,
        sb, sb, sb + saturation
      );
      color.rgb = clamp(saturationMatrix * color.rgb, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));
    `);
  }
  if (style.gamma !== void 0) {
    const gamma = expressionToGlsl(context, style.gamma, NumberType);
    pipeline.push(`color.rgb = pow(color.rgb, vec3(1.0 / ${gamma}));`);
  }
  if (style.brightness !== void 0) {
    const brightness = expressionToGlsl(context, style.brightness, NumberType);
    pipeline.push(`color.rgb = clamp(color.rgb + ${brightness}, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));`);
  }
  const uniforms = {};
  const numVariables = Object.keys(context.variables).length;
  if (numVariables > 1 && !style.variables) {
    throw new Error(`Missing variables in style (expected ${context.variables})`);
  }
  for (let i = 0; i < numVariables; ++i) {
    const variable = context.variables[Object.keys(context.variables)[i]];
    if (!(variable.name in style.variables)) {
      throw new Error(`Missing '${variable.name}' in style variables`);
    }
    const uniformName = uniformNameForVariable(variable.name);
    uniforms[uniformName] = function() {
      let value = style.variables[variable.name];
      if (typeof value === "string") {
        value = getStringNumberEquivalent(value);
      }
      return value !== void 0 ? value : -9999999;
    };
  }
  const uniformDeclarations = Object.keys(uniforms).map(function(name) {
    return `uniform float ${name};`;
  });
  const textureCount = Math.ceil(bandCount / 4);
  uniformDeclarations.push(`uniform sampler2D ${Uniforms2.TILE_TEXTURE_ARRAY}[${textureCount}];`);
  if (context.paletteTextures) {
    uniformDeclarations.push(`uniform sampler2D ${PALETTE_TEXTURE_ARRAY}[${context.paletteTextures.length}];`);
  }
  const functionDefintions = Object.keys(context.functions).map(function(name) {
    return context.functions[name];
  });
  const fragmentShader = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif

    varying vec2 v_textureCoord;
    varying vec2 v_mapCoord;
    uniform vec4 ${Uniforms2.RENDER_EXTENT};
    uniform float ${Uniforms2.TRANSITION_ALPHA};
    uniform float ${Uniforms2.TEXTURE_PIXEL_WIDTH};
    uniform float ${Uniforms2.TEXTURE_PIXEL_HEIGHT};
    uniform float ${Uniforms2.RESOLUTION};
    uniform float ${Uniforms2.ZOOM};

    ${uniformDeclarations.join("\n")}

    ${functionDefintions.join("\n")}

    void main() {
      if (
        v_mapCoord[0] < ${Uniforms2.RENDER_EXTENT}[0] ||
        v_mapCoord[1] < ${Uniforms2.RENDER_EXTENT}[1] ||
        v_mapCoord[0] > ${Uniforms2.RENDER_EXTENT}[2] ||
        v_mapCoord[1] > ${Uniforms2.RENDER_EXTENT}[3]
      ) {
        discard;
      }

      vec4 color = texture2D(${Uniforms2.TILE_TEXTURE_ARRAY}[0],  v_textureCoord);

      ${pipeline.join("\n")}

      gl_FragColor = color;
      gl_FragColor.rgb *= gl_FragColor.a;
      gl_FragColor *= ${Uniforms2.TRANSITION_ALPHA};
    }`;
  return {
    vertexShader,
    fragmentShader,
    uniforms,
    paletteTextures: context.paletteTextures
  };
}
var WebGLTileLayer = class extends BaseTile_default {
  /**
   * @param {Options} options Tile layer options.
   */
  constructor(options) {
    options = options ? Object.assign({}, options) : {};
    const style = options.style || {};
    delete options.style;
    super(options);
    this.sources_ = options.sources;
    this.renderedSource_ = null;
    this.renderedResolution_ = NaN;
    this.style_ = style;
    this.styleVariables_ = this.style_.variables || {};
    this.addChangeListener(Property_default.SOURCE, this.handleSourceUpdate_);
  }
  /**
   * Gets the sources for this layer, for a given extent and resolution.
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {number} resolution Resolution.
   * @return {Array<SourceType>} Sources.
   */
  getSources(extent, resolution) {
    const source = this.getSource();
    return this.sources_ ? typeof this.sources_ === "function" ? this.sources_(extent, resolution) : this.sources_ : source ? [source] : [];
  }
  /**
   * @return {SourceType} The source being rendered.
   * @override
   */
  getRenderSource() {
    return this.renderedSource_ || this.getSource();
  }
  /**
   * @return {import("../source/Source.js").State} Source state.
   * @override
   */
  getSourceState() {
    const source = this.getRenderSource();
    return source ? source.getState() : "undefined";
  }
  /**
   * @private
   */
  handleSourceUpdate_() {
    if (this.hasRenderer()) {
      this.getRenderer().clearCache();
    }
    const source = this.getSource();
    if (source) {
      if (source.getState() === "loading") {
        const onChange = () => {
          if (source.getState() === "ready") {
            source.removeEventListener("change", onChange);
            this.setStyle(this.style_);
          }
        };
        source.addEventListener("change", onChange);
      } else {
        this.setStyle(this.style_);
      }
    }
  }
  /**
   * @private
   * @return {number} The number of source bands.
   */
  getSourceBandCount_() {
    const max = Number.MAX_SAFE_INTEGER;
    const sources = this.getSources([-max, -max, max, max], max);
    return sources && sources.length && "bandCount" in sources[0] ? sources[0].bandCount : 4;
  }
  /**
   * @override
   */
  createRenderer() {
    const parsedStyle = parseStyle(this.style_, this.getSourceBandCount_());
    return new TileLayer_default(this, {
      vertexShader: parsedStyle.vertexShader,
      fragmentShader: parsedStyle.fragmentShader,
      uniforms: parsedStyle.uniforms,
      cacheSize: this.getCacheSize(),
      paletteTextures: parsedStyle.paletteTextures
    });
  }
  /**
   * @param {import("../Map").FrameState} frameState Frame state.
   * @param {Array<SourceType>} sources Sources.
   * @return {HTMLElement} Canvas.
   */
  renderSources(frameState, sources) {
    const layerRenderer = this.getRenderer();
    let canvas;
    for (let i = 0, ii = sources.length; i < ii; ++i) {
      this.renderedSource_ = sources[i];
      if (layerRenderer.prepareFrame(frameState)) {
        canvas = layerRenderer.renderFrame(frameState);
      }
    }
    return canvas;
  }
  /**
   * @param {?import("../Map.js").FrameState} frameState Frame state.
   * @param {HTMLElement} target Target which the renderer may (but need not) use
   * for rendering its content.
   * @return {HTMLElement} The rendered element.
   * @override
   */
  render(frameState, target) {
    this.rendered = true;
    const viewState = frameState.viewState;
    const sources = this.getSources(frameState.extent, viewState.resolution);
    let ready = true;
    for (let i = 0, ii = sources.length; i < ii; ++i) {
      const source = sources[i];
      const sourceState = source.getState();
      if (sourceState == "loading") {
        const onChange = () => {
          if (source.getState() == "ready") {
            source.removeEventListener("change", onChange);
            this.changed();
          }
        };
        source.addEventListener("change", onChange);
      }
      ready = ready && sourceState == "ready";
    }
    const canvas = this.renderSources(frameState, sources);
    if (this.getRenderer().renderComplete && ready) {
      this.renderedResolution_ = viewState.resolution;
      return canvas;
    }
    if (this.renderedResolution_ > 0.5 * viewState.resolution) {
      const altSources = this.getSources(frameState.extent, this.renderedResolution_).filter((source) => !sources.includes(source));
      if (altSources.length > 0) {
        return this.renderSources(frameState, altSources);
      }
    }
    return canvas;
  }
  /**
   * Update the layer style.  The `updateStyleVariables` function is a more efficient
   * way to update layer rendering.  In cases where the whole style needs to be updated,
   * this method may be called instead.  Note that calling this method will also replace
   * any previously set variables, so the new style also needs to include new variables,
   * if needed.
   * @param {Style} style The new style.
   */
  setStyle(style) {
    this.styleVariables_ = style.variables || {};
    this.style_ = style;
    if (this.hasRenderer()) {
      const parsedStyle = parseStyle(this.style_, this.getSourceBandCount_());
      const renderer = this.getRenderer();
      renderer.reset({
        vertexShader: parsedStyle.vertexShader,
        fragmentShader: parsedStyle.fragmentShader,
        uniforms: parsedStyle.uniforms,
        paletteTextures: parsedStyle.paletteTextures
      });
      this.changed();
    }
  }
  /**
   * Update any variables used by the layer style and trigger a re-render.
   * @param {Object<string, number>} variables Variables to update.
   * @api
   */
  updateStyleVariables(variables) {
    Object.assign(this.styleVariables_, variables);
    this.changed();
  }
};
WebGLTileLayer.prototype.dispose;
var WebGLTile_default = WebGLTileLayer;

export {
  ARRAY_BUFFER,
  ELEMENT_ARRAY_BUFFER,
  DYNAMIC_DRAW,
  Buffer_default,
  DefaultUniform,
  AttributeType,
  Layer_default2 as Layer_default,
  colorEncodeId,
  colorDecodeId,
  ShaderBuilder,
  parseLiteralStyle,
  WebGLTile_default
};
//# sourceMappingURL=chunk-3T5KK3ME.js.map
