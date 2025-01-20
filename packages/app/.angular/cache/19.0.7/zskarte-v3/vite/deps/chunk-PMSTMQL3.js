import {
  ERROR_THRESHOLD,
  Triangulation_default,
  calculateSourceExtentResolution
} from "./chunk-CJZ66Y35.js";
import {
  Tile_default
} from "./chunk-WUEFYFM4.js";
import {
  TileState_default
} from "./chunk-WFUVBADM.js";
import {
  createCanvasContext2D
} from "./chunk-73LIRBW3.js";
import {
  WORKER_OFFSCREEN_CANVAS
} from "./chunk-AIKGHEYG.js";
import {
  createEmpty,
  extend,
  getArea,
  getHeight,
  getIntersection,
  getTopLeft,
  getWidth,
  wrapAndSliceX
} from "./chunk-IHYRLUFT.js";
import {
  EventType_default,
  listen,
  unlistenByKey
} from "./chunk-X7DDFSZC.js";
import {
  clamp
} from "./chunk-3IATBWUD.js";

// ../../node_modules/ol/DataTile.js
function asImageLike(data) {
  return data instanceof Image || data instanceof HTMLCanvasElement || data instanceof HTMLVideoElement || data instanceof ImageBitmap ? data : null;
}
function asArrayLike(data) {
  return data instanceof Uint8Array || data instanceof Uint8ClampedArray || data instanceof Float32Array || data instanceof DataView ? data : null;
}
var disposedError = new Error("disposed");
var sharedContext = null;
function toArray(image) {
  if (!sharedContext) {
    sharedContext = createCanvasContext2D(image.width, image.height, void 0, {
      willReadFrequently: true
    });
  }
  const canvas = sharedContext.canvas;
  const width = image.width;
  if (canvas.width !== width) {
    canvas.width = width;
  }
  const height = image.height;
  if (canvas.height !== height) {
    canvas.height = height;
  }
  sharedContext.clearRect(0, 0, width, height);
  sharedContext.drawImage(image, 0, 0);
  return sharedContext.getImageData(0, 0, width, height).data;
}
var defaultSize = [256, 256];
var DataTile = class extends Tile_default {
  /**
   * @param {Options} options Tile options.
   */
  constructor(options) {
    const state = TileState_default.IDLE;
    super(options.tileCoord, state, {
      transition: options.transition,
      interpolate: options.interpolate
    });
    this.loader_ = options.loader;
    this.data_ = null;
    this.error_ = null;
    this.size_ = options.size || null;
    this.controller_ = options.controller || null;
  }
  /**
   * Get the tile size.
   * @return {import('./size.js').Size} Tile size.
   */
  getSize() {
    if (this.size_) {
      return this.size_;
    }
    const imageData = asImageLike(this.data_);
    if (imageData) {
      return [imageData.width, imageData.height];
    }
    return defaultSize;
  }
  /**
   * Get the data for the tile.
   * @return {Data} Tile data.
   * @api
   */
  getData() {
    return this.data_;
  }
  /**
   * Get any loading error.
   * @return {Error} Loading error.
   * @api
   */
  getError() {
    return this.error_;
  }
  /**
   * Load the tile data.
   * @api
   * @override
   */
  load() {
    if (this.state !== TileState_default.IDLE && this.state !== TileState_default.ERROR) {
      return;
    }
    this.state = TileState_default.LOADING;
    this.changed();
    const self = this;
    this.loader_().then(function(data) {
      self.data_ = data;
      self.state = TileState_default.LOADED;
      self.changed();
    }).catch(function(error) {
      self.error_ = error;
      self.state = TileState_default.ERROR;
      self.changed();
    });
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    if (this.controller_) {
      this.controller_.abort(disposedError);
      this.controller_ = null;
    }
    super.disposeInternal();
  }
};
var DataTile_default = DataTile;

// ../../node_modules/ol/vec/mat4.js
function create() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function fromTransform(mat4, transform) {
  mat4[0] = transform[0];
  mat4[1] = transform[1];
  mat4[4] = transform[2];
  mat4[5] = transform[3];
  mat4[12] = transform[4];
  mat4[13] = transform[5];
  return mat4;
}
function orthographic(left, right, bottom, top, near, far, out) {
  out = out ?? create();
  const lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
function scale(m, x, y, z, out) {
  out = out ?? create();
  out[0] = m[0] * x;
  out[1] = m[1] * x;
  out[2] = m[2] * x;
  out[3] = m[3] * x;
  out[4] = m[4] * y;
  out[5] = m[5] * y;
  out[6] = m[6] * y;
  out[7] = m[7] * y;
  out[8] = m[8] * z;
  out[9] = m[9] * z;
  out[10] = m[10] * z;
  out[11] = m[11] * z;
  out[12] = m[12];
  out[13] = m[13];
  out[14] = m[14];
  out[15] = m[15];
  return out;
}
function translate(m, x, y, z, out) {
  out = out ?? create();
  let a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23;
  if (m === out) {
    out[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
    out[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
  } else {
    a00 = m[0];
    a01 = m[1];
    a02 = m[2];
    a03 = m[3];
    a10 = m[4];
    a11 = m[5];
    a12 = m[6];
    a13 = m[7];
    a20 = m[8];
    a21 = m[9];
    a22 = m[10];
    a23 = m[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + m[12];
    out[13] = a01 * x + a11 * y + a21 * z + m[13];
    out[14] = a02 * x + a12 * y + a22 * z + m[14];
    out[15] = a03 * x + a13 * y + a23 * z + m[15];
  }
  return out;
}
function translation(x, y, z, out) {
  out = out ?? create();
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = x;
  out[13] = y;
  out[14] = z;
  out[15] = 1;
  return out;
}

// ../../node_modules/ol/webgl/Canvas.js
var VERTEX_SHADER = `
  attribute vec4 a_position;
  attribute vec4 a_texcoord;

  uniform mat4 u_matrix;
  uniform mat4 u_textureMatrix;

  varying vec2 v_texcoord;

  void main() {
    gl_Position = u_matrix * a_position;
    vec2 texcoord = (u_textureMatrix * a_texcoord).xy;
    v_texcoord = texcoord;
  }
`;
var FRAGMENT_SHADER = `
  precision mediump float;

  varying vec2 v_texcoord;

  uniform sampler2D u_texture;

  void main() {
    if (
      v_texcoord.x < 0.0 ||
      v_texcoord.y < 0.0 ||
      v_texcoord.x > 1.0 ||
      v_texcoord.y > 1.0
    ) {
      discard;
    }
    gl_FragColor = texture2D(u_texture, v_texcoord);
  }
`;
var Canvas = class {
  /**
   * @param {WebGLRenderingContext} gl Context to render in.
   */
  constructor(gl) {
    this.gl_ = gl;
    this.program_ = createProgram(gl, FRAGMENT_SHADER, VERTEX_SHADER);
    this.positionLocation = gl.getAttribLocation(this.program_, "a_position");
    this.texcoordLocation = gl.getAttribLocation(this.program_, "a_texcoord");
    this.matrixLocation = gl.getUniformLocation(this.program_, "u_matrix");
    this.textureMatrixLocation = gl.getUniformLocation(this.program_, "u_textureMatrix");
    this.textureLocation = gl.getUniformLocation(this.program_, "u_texture");
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    this.positions = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
    this.texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    this.texcoords = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texcoords), gl.STATIC_DRAW);
  }
  /**
   * 2dContext drawImage call implemented in webgl.
   * Unlike images, textures do not have a width and height associated
   * with them so we'll pass in the width and height of the texture.
   *
   * @param {WebGLTexture} tex Image to draw.
   * @param {number} texWidth Image width.
   * @param {number} texHeight Image height.
   * @param {number} srcX Top-left x-point to read src image.
   * @param {number} srcY Top-left y-point to read src image.
   * @param {number} [srcWidth] Width of source to read.
   * @param {number} [srcHeight] Height of source to read.
   * @param {number} [dstX] Top-left x-point of destination.
   * @param {number} [dstY] Top-left y-point of destination.
   * @param {number} [dstWidth] Width of written image in destination.
   * @param {number} [dstHeight] Height of written image in destination.
   * @param {number} [width] Width of canvas.
   * @param {number} [height] Height of canvas.
   */
  drawImage(tex, texWidth, texHeight, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, width, height) {
    const gl = this.gl_;
    if (dstX === void 0) {
      dstX = srcX;
    }
    if (dstY === void 0) {
      dstY = srcY;
    }
    if (srcWidth === void 0) {
      srcWidth = texWidth;
    }
    if (srcHeight === void 0) {
      srcHeight = texHeight;
    }
    if (dstWidth === void 0) {
      dstWidth = srcWidth;
    }
    if (dstHeight === void 0) {
      dstHeight = srcHeight;
    }
    if (width === void 0) {
      width = gl.canvas.width;
    }
    if (height === void 0) {
      height = gl.canvas.height;
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.useProgram(this.program_);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    let matrix = orthographic(0, width, 0, height, -1, 1);
    matrix = translate(matrix, dstX, dstY, 0);
    matrix = scale(matrix, dstWidth, dstHeight, 1);
    gl.uniformMatrix4fv(this.matrixLocation, false, matrix);
    let texMatrix = translation(srcX / texWidth, srcY / texHeight, 0);
    texMatrix = scale(texMatrix, srcWidth / texWidth, srcHeight / texHeight, 1);
    gl.uniformMatrix4fv(this.textureMatrixLocation, false, texMatrix);
    gl.uniform1i(this.textureLocation, 0);
    gl.drawArrays(gl.TRIANGLES, 0, this.positions.length / 2);
  }
};
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("Shader compilation failed");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    if (log === null) {
      throw new Error("Shader info log creation failed");
    }
    throw new Error(log);
  }
  return shader;
}
function createProgram(gl, fragmentSource, vertexSource) {
  const program = gl.createProgram();
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (program === null) {
    throw new Error("Program creation failed");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    if (log === null) {
      throw new Error("Program info log creation failed");
    }
    throw new Error();
  }
  return program;
}

// ../../node_modules/ol/reproj/glreproj.js
var EDGE_VERTEX_SHADER = `
  attribute vec4 a_position;

  uniform mat4 u_matrix;

  void main() {
     gl_Position = u_matrix * a_position;
  }
`;
var EDGE_FRAGMENT_SHADER = `
  precision mediump float;

  uniform vec4 u_val;
  void main() {
     gl_FragColor = u_val;
  }
`;
var TRIANGLE_VERTEX_SHADER = `
  attribute vec4 a_position;
  attribute vec2 a_texcoord;

  varying vec2 v_texcoord;

  uniform mat4 u_matrix;

  void main() {
     gl_Position = u_matrix * a_position;
     v_texcoord = a_texcoord;
  }
`;
var TRIANGLE_FRAGMENT_SHADER = `
  precision mediump float;

  varying vec2 v_texcoord;

  uniform sampler2D u_texture;

  void main() {
    if (v_texcoord.x < 0.0 || v_texcoord.x > 1.0 || v_texcoord.y < 0.0 || v_texcoord.y > 1.0) {
      discard;
    }
    gl_FragColor = texture2D(u_texture, v_texcoord);
  }
`;
function createCanvasContextWebGL(width, height, canvasPool, settings) {
  let canvas;
  if (canvasPool && canvasPool.length) {
    canvas = /** @type {HTMLCanvasElement} */
    canvasPool.shift();
  } else if (WORKER_OFFSCREEN_CANVAS) {
    canvas = new OffscreenCanvas(width || 300, height || 300);
  } else {
    canvas = document.createElement("canvas");
  }
  if (width) {
    canvas.width = width;
  }
  if (height) {
    canvas.height = height;
  }
  return (
    /** @type {WebGLRenderingContext} */
    canvas.getContext("webgl", settings)
  );
}
function releaseGLCanvas(gl) {
  const canvas = gl.canvas;
  canvas.width = 1;
  canvas.height = 1;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
}
var canvasGLPool = [];
function render(gl, width_, height_, pixelRatio, sourceResolution, targetResolution, targetExtent, triangulation, sources, gutter, dataType, renderEdges, interpolate, drawSingle) {
  const width = Math.round(pixelRatio * width_);
  const height = Math.round(pixelRatio * height_);
  gl.canvas.width = width;
  gl.canvas.height = height;
  let resultFrameBuffer;
  let resultTexture;
  {
    resultTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, resultTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (interpolate) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, dataType, null);
    resultFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, resultFrameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, resultTexture, 0);
  }
  if (resultFrameBuffer === null) {
    throw new Error("Could not create framebuffer");
  }
  if (resultTexture === null) {
    throw new Error("Could not create texture");
  }
  if (sources.length === 0) {
    return {
      width,
      height,
      framebuffer: resultFrameBuffer,
      texture: resultTexture
    };
  }
  const sourceDataExtent = createEmpty();
  sources.forEach(function(src, i, arr) {
    extend(sourceDataExtent, src.extent);
  });
  let stitchTexture;
  let stitchWidth;
  let stitchHeight;
  const stitchScale = 1 / sourceResolution;
  if (!drawSingle || sources.length !== 1 || gutter !== 0) {
    stitchTexture = gl.createTexture();
    if (resultTexture === null) {
      throw new Error("Could not create texture");
    }
    stitchWidth = Math.round(getWidth(sourceDataExtent) * stitchScale);
    stitchHeight = Math.round(getHeight(sourceDataExtent) * stitchScale);
    const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const largeSide = Math.max(stitchWidth, stitchHeight);
    const scaleFactor = largeSide > maxTexSize ? maxTexSize / largeSide : 1;
    const stitchWidthFixed = Math.round(stitchWidth * scaleFactor);
    const stitchHeightFixed = Math.round(stitchHeight * scaleFactor);
    gl.bindTexture(gl.TEXTURE_2D, stitchTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (interpolate) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, stitchWidthFixed, stitchHeightFixed, 0, gl.RGBA, dataType, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, stitchTexture, 0);
    const webGLCanvas = new Canvas(gl);
    sources.forEach(function(src, i, arr) {
      const xPos = (src.extent[0] - sourceDataExtent[0]) * stitchScale * scaleFactor;
      const yPos = -(src.extent[3] - sourceDataExtent[3]) * stitchScale * scaleFactor;
      const srcWidth = getWidth(src.extent) * stitchScale * scaleFactor;
      const srcHeight = getHeight(src.extent) * stitchScale * scaleFactor;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, stitchWidthFixed, stitchHeightFixed);
      if (src.clipExtent) {
        const xPos2 = (src.clipExtent[0] - sourceDataExtent[0]) * stitchScale * scaleFactor;
        const yPos2 = -(src.clipExtent[3] - sourceDataExtent[3]) * stitchScale * scaleFactor;
        const width2 = getWidth(src.clipExtent) * stitchScale * scaleFactor;
        const height2 = getHeight(src.clipExtent) * stitchScale * scaleFactor;
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(interpolate ? xPos2 : Math.round(xPos2), interpolate ? yPos2 : Math.round(yPos2), interpolate ? width2 : Math.round(xPos2 + width2) - Math.round(xPos2), interpolate ? height2 : Math.round(yPos2 + height2) - Math.round(yPos2));
      }
      webGLCanvas.drawImage(src.texture, src.width, src.height, gutter, gutter, src.width - 2 * gutter, src.height - 2 * gutter, interpolate ? xPos : Math.round(xPos), interpolate ? yPos : Math.round(yPos), interpolate ? srcWidth : Math.round(xPos + srcWidth) - Math.round(xPos), interpolate ? srcHeight : Math.round(yPos + srcHeight) - Math.round(yPos), stitchWidthFixed, stitchHeightFixed);
      gl.disable(gl.SCISSOR_TEST);
    });
    gl.deleteFramebuffer(fb);
  } else {
    stitchTexture = sources[0].texture;
    stitchWidth = sources[0].width;
    stitchHeight = sources[0].width;
  }
  const targetTopLeft = getTopLeft(targetExtent);
  const sourceTopLeft = getTopLeft(sourceDataExtent);
  const getUVs = (target) => {
    const u0 = (target[0][0] - targetTopLeft[0]) / targetResolution * pixelRatio;
    const v0 = -(target[0][1] - targetTopLeft[1]) / targetResolution * pixelRatio;
    const u1 = (target[1][0] - targetTopLeft[0]) / targetResolution * pixelRatio;
    const v1 = -(target[1][1] - targetTopLeft[1]) / targetResolution * pixelRatio;
    const u2 = (target[2][0] - targetTopLeft[0]) / targetResolution * pixelRatio;
    const v2 = -(target[2][1] - targetTopLeft[1]) / targetResolution * pixelRatio;
    return {
      u1,
      v1,
      u0,
      v0,
      u2,
      v2
    };
  };
  gl.bindFramebuffer(gl.FRAMEBUFFER, resultFrameBuffer);
  gl.viewport(0, 0, width, height);
  {
    const vertices = [];
    const texcoords = [];
    const triProgram = createProgram(gl, TRIANGLE_FRAGMENT_SHADER, TRIANGLE_VERTEX_SHADER);
    gl.useProgram(triProgram);
    const textureLocation = gl.getUniformLocation(triProgram, "u_texture");
    gl.bindTexture(gl.TEXTURE_2D, stitchTexture);
    gl.uniform1i(textureLocation, 0);
    triangulation.getTriangles().forEach(function(triangle, i, arr) {
      const source = triangle.source;
      const target = triangle.target;
      const {
        u1,
        v1,
        u0,
        v0,
        u2,
        v2
      } = getUVs(target);
      const su0 = (source[0][0] - sourceTopLeft[0]) / sourceResolution / stitchWidth;
      const sv0 = -(source[0][1] - sourceTopLeft[1]) / sourceResolution / stitchHeight;
      const su1 = (source[1][0] - sourceTopLeft[0]) / sourceResolution / stitchWidth;
      const sv1 = -(source[1][1] - sourceTopLeft[1]) / sourceResolution / stitchHeight;
      const su2 = (source[2][0] - sourceTopLeft[0]) / sourceResolution / stitchWidth;
      const sv2 = -(source[2][1] - sourceTopLeft[1]) / sourceResolution / stitchHeight;
      vertices.push(u1, v1, u0, v0, u2, v2);
      texcoords.push(su1, sv1, su0, sv0, su2, sv2);
    });
    const matrix = orthographic(0, width, height, 0, -1, 1);
    const matrixLocation = gl.getUniformLocation(triProgram, "u_matrix");
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    const positionLocation = gl.getAttribLocation(triProgram, "a_position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);
    const texcoordLocation = gl.getAttribLocation(triProgram, "a_texcoord");
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  }
  if (renderEdges) {
    const edgeProgram = createProgram(gl, EDGE_FRAGMENT_SHADER, EDGE_VERTEX_SHADER);
    gl.useProgram(edgeProgram);
    const matrix = orthographic(0, width, height, 0, -1, 1);
    const matrixLocation = gl.getUniformLocation(edgeProgram, "u_matrix");
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    const burnval = Array.isArray(renderEdges) ? renderEdges : [0, 0, 0, 255];
    const burnvalLocation = gl.getUniformLocation(edgeProgram, "u_val");
    const isFloat = true;
    if (isFloat) {
      gl.uniform4fv(burnvalLocation, burnval);
    } else {
      gl.uniform4iv(burnvalLocation, burnval);
    }
    const positionLocation = gl.getAttribLocation(edgeProgram, "a_position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);
    const lines = triangulation.getTriangles().reduce(function(lines2, triangle) {
      const target = triangle.target;
      const {
        u1,
        v1,
        u0,
        v0,
        u2,
        v2
      } = getUVs(target);
      return lines2.concat([u1, v1, u0, v0, u0, v0, u2, v2, u2, v2, u1, v1]);
    }, []);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINES, 0, lines.length / 2);
  }
  return {
    width,
    height,
    framebuffer: resultFrameBuffer,
    texture: resultTexture
  };
}

// ../../node_modules/ol/reproj/DataTile.js
var ReprojDataTile = class extends DataTile_default {
  /**
   * @param {Options} options Tile options.
   */
  constructor(options) {
    super({
      tileCoord: options.tileCoord,
      loader: () => Promise.resolve(new Uint8ClampedArray(4)),
      interpolate: options.interpolate,
      transition: options.transition
    });
    this.renderEdges_ = options.renderEdges !== void 0 ? options.renderEdges : false;
    this.pixelRatio_ = options.pixelRatio;
    this.gutter_ = options.gutter;
    this.reprojData_ = null;
    this.reprojError_ = null;
    this.reprojSize_ = void 0;
    this.sourceTileGrid_ = options.sourceTileGrid;
    this.targetTileGrid_ = options.targetTileGrid;
    this.wrappedTileCoord_ = options.wrappedTileCoord || options.tileCoord;
    this.sourceTiles_ = [];
    this.sourcesListenerKeys_ = null;
    this.sourceZ_ = 0;
    const sourceProj = options.sourceProj;
    const sourceProjExtent = sourceProj.getExtent();
    const sourceTileGridExtent = options.sourceTileGrid.getExtent();
    this.clipExtent_ = sourceProj.canWrapX() ? sourceTileGridExtent ? getIntersection(sourceProjExtent, sourceTileGridExtent) : sourceProjExtent : sourceTileGridExtent;
    const targetExtent = this.targetTileGrid_.getTileCoordExtent(this.wrappedTileCoord_);
    const maxTargetExtent = this.targetTileGrid_.getExtent();
    let maxSourceExtent = this.sourceTileGrid_.getExtent();
    const limitedTargetExtent = maxTargetExtent ? getIntersection(targetExtent, maxTargetExtent) : targetExtent;
    if (getArea(limitedTargetExtent) === 0) {
      this.state = TileState_default.EMPTY;
      return;
    }
    if (sourceProjExtent) {
      if (!maxSourceExtent) {
        maxSourceExtent = sourceProjExtent;
      } else {
        maxSourceExtent = getIntersection(maxSourceExtent, sourceProjExtent);
      }
    }
    const targetResolution = this.targetTileGrid_.getResolution(this.wrappedTileCoord_[0]);
    const targetProj = options.targetProj;
    const sourceResolution = calculateSourceExtentResolution(sourceProj, targetProj, limitedTargetExtent, targetResolution);
    if (!isFinite(sourceResolution) || sourceResolution <= 0) {
      this.state = TileState_default.EMPTY;
      return;
    }
    const errorThresholdInPixels = options.errorThreshold !== void 0 ? options.errorThreshold : ERROR_THRESHOLD;
    this.triangulation_ = new Triangulation_default(sourceProj, targetProj, limitedTargetExtent, maxSourceExtent, sourceResolution * errorThresholdInPixels, targetResolution, options.transformMatrix);
    if (this.triangulation_.getTriangles().length === 0) {
      this.state = TileState_default.EMPTY;
      return;
    }
    this.sourceZ_ = this.sourceTileGrid_.getZForResolution(sourceResolution);
    let sourceExtent = this.triangulation_.calculateSourceExtent();
    if (maxSourceExtent) {
      if (sourceProj.canWrapX()) {
        sourceExtent[1] = clamp(sourceExtent[1], maxSourceExtent[1], maxSourceExtent[3]);
        sourceExtent[3] = clamp(sourceExtent[3], maxSourceExtent[1], maxSourceExtent[3]);
      } else {
        sourceExtent = getIntersection(sourceExtent, maxSourceExtent);
      }
    }
    if (!getArea(sourceExtent)) {
      this.state = TileState_default.EMPTY;
    } else {
      let worldWidth = 0;
      let worldsAway = 0;
      if (sourceProj.canWrapX()) {
        worldWidth = getWidth(sourceProjExtent);
        worldsAway = Math.floor((sourceExtent[0] - sourceProjExtent[0]) / worldWidth);
      }
      const sourceExtents = wrapAndSliceX(sourceExtent.slice(), sourceProj, true);
      sourceExtents.forEach((extent) => {
        const sourceRange = this.sourceTileGrid_.getTileRangeForExtentAndZ(extent, this.sourceZ_);
        const getTile = options.getTileFunction;
        for (let srcX = sourceRange.minX; srcX <= sourceRange.maxX; srcX++) {
          for (let srcY = sourceRange.minY; srcY <= sourceRange.maxY; srcY++) {
            const tile = getTile(this.sourceZ_, srcX, srcY, this.pixelRatio_);
            if (tile) {
              const offset = worldsAway * worldWidth;
              this.sourceTiles_.push({
                tile,
                offset
              });
            }
          }
        }
        ++worldsAway;
      });
      if (this.sourceTiles_.length === 0) {
        this.state = TileState_default.EMPTY;
      }
    }
  }
  /**
   * Get the tile size.
   * @return {import('../size.js').Size} Tile size.
   * @override
   */
  getSize() {
    return this.reprojSize_;
  }
  /**
   * Get the data for the tile.
   * @return {import("../DataTile.js").Data} Tile data.
   * @override
   */
  getData() {
    return this.reprojData_;
  }
  /**
   * Get any loading error.
   * @return {Error} Loading error.
   * @override
   */
  getError() {
    return this.reprojError_;
  }
  /**
   * @private
   */
  reproject_() {
    const dataSources = [];
    let imageLike = false;
    this.sourceTiles_.forEach((source) => {
      const tile = source.tile;
      if (!tile || tile.getState() !== TileState_default.LOADED) {
        return;
      }
      const size2 = tile.getSize();
      const gutter = this.gutter_;
      let tileData;
      const arrayData = asArrayLike(tile.getData());
      if (arrayData) {
        tileData = arrayData;
      } else {
        imageLike = true;
        tileData = toArray(asImageLike(tile.getData()));
      }
      const pixelSize = [size2[0] + 2 * gutter, size2[1] + 2 * gutter];
      const isFloat = tileData instanceof Float32Array;
      const pixelCount = pixelSize[0] * pixelSize[1];
      const DataType = isFloat ? Float32Array : Uint8ClampedArray;
      const tileDataR = new DataType(tileData.buffer);
      const bytesPerElement = DataType.BYTES_PER_ELEMENT;
      const bytesPerPixel = bytesPerElement * tileDataR.length / pixelCount;
      const bytesPerRow = tileDataR.byteLength / pixelSize[1];
      const bandCount2 = Math.floor(bytesPerRow / bytesPerElement / pixelSize[0]);
      const extent = this.sourceTileGrid_.getTileCoordExtent(tile.tileCoord);
      extent[0] += source.offset;
      extent[2] += source.offset;
      const clipExtent = this.clipExtent_?.slice();
      if (clipExtent) {
        clipExtent[0] += source.offset;
        clipExtent[2] += source.offset;
      }
      dataSources.push({
        extent,
        clipExtent,
        data: tileDataR,
        dataType: DataType,
        bytesPerPixel,
        pixelSize,
        bandCount: bandCount2
      });
    });
    this.sourceTiles_.length = 0;
    if (dataSources.length === 0) {
      this.state = TileState_default.ERROR;
      this.changed();
      return;
    }
    const z = this.wrappedTileCoord_[0];
    const size = this.targetTileGrid_.getTileSize(z);
    const targetWidth = typeof size === "number" ? size : size[0];
    const targetHeight = typeof size === "number" ? size : size[1];
    const outWidth = targetWidth * this.pixelRatio_;
    const outHeight = targetHeight * this.pixelRatio_;
    const targetResolution = this.targetTileGrid_.getResolution(z);
    const sourceResolution = this.sourceTileGrid_.getResolution(this.sourceZ_);
    const targetExtent = this.targetTileGrid_.getTileCoordExtent(this.wrappedTileCoord_);
    const bandCount = dataSources[0].bandCount;
    const dataR = new dataSources[0].dataType(bandCount * outWidth * outHeight);
    const gl = createCanvasContextWebGL(outWidth, outHeight, canvasGLPool, {
      premultipliedAlpha: false,
      antialias: false
    });
    let willInterpolate;
    const format = gl.RGBA;
    let textureType;
    if (dataSources[0].dataType == Float32Array) {
      textureType = gl.FLOAT;
      gl.getExtension("WEBGL_color_buffer_float");
      gl.getExtension("OES_texture_float");
      gl.getExtension("EXT_float_blend");
      const extension = gl.getExtension("OES_texture_float_linear");
      const canInterpolate = extension !== null;
      willInterpolate = canInterpolate && this.interpolate;
    } else {
      textureType = gl.UNSIGNED_BYTE;
      willInterpolate = this.interpolate;
    }
    const BANDS_PR_REPROJ = 4;
    const reprojs = Math.ceil(bandCount / BANDS_PR_REPROJ);
    for (let reproj = reprojs - 1; reproj >= 0; --reproj) {
      const sources = [];
      for (let i = 0, len = dataSources.length; i < len; ++i) {
        const dataSource = dataSources[i];
        const pixelSize = dataSource.pixelSize;
        const width2 = pixelSize[0];
        const height2 = pixelSize[1];
        const data2 = new dataSource.dataType(BANDS_PR_REPROJ * width2 * height2);
        const dataS = dataSource.data;
        let offset2 = reproj * BANDS_PR_REPROJ;
        for (let j = 0, len2 = data2.length; j < len2; j += BANDS_PR_REPROJ) {
          data2[j] = dataS[offset2];
          data2[j + 1] = dataS[offset2 + 1];
          data2[j + 2] = dataS[offset2 + 2];
          data2[j + 3] = dataS[offset2 + 3];
          offset2 += bandCount;
        }
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if (willInterpolate) {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width2, height2, 0, format, textureType, data2);
        sources.push({
          extent: dataSource.extent,
          clipExtent: dataSource.clipExtent,
          texture,
          width: width2,
          height: height2
        });
      }
      const {
        framebuffer,
        width,
        height
      } = render(gl, targetWidth, targetHeight, this.pixelRatio_, sourceResolution, targetResolution, targetExtent, this.triangulation_, sources, this.gutter_, textureType, this.renderEdges_, willInterpolate);
      const rows = width;
      const cols = height * BANDS_PR_REPROJ;
      const data = new dataSources[0].dataType(rows * cols);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.readPixels(0, 0, width, height, gl.RGBA, textureType, data);
      let offset = reproj * BANDS_PR_REPROJ;
      for (let i = 0, len = data.length; i < len; i += BANDS_PR_REPROJ) {
        const flipY = (rows - 1 - (i / cols | 0)) * cols + i % cols;
        dataR[offset] = data[flipY];
        dataR[offset + 1] = data[flipY + 1];
        dataR[offset + 2] = data[flipY + 2];
        dataR[offset + 3] = data[flipY + 3];
        offset += bandCount;
      }
    }
    releaseGLCanvas(gl);
    canvasGLPool.push(gl.canvas);
    if (imageLike) {
      const context = createCanvasContext2D(targetWidth, targetHeight);
      const imageData = new ImageData(dataR, targetWidth);
      context.putImageData(imageData, 0, 0);
      this.reprojData_ = context.canvas;
    } else {
      this.reprojData_ = dataR;
    }
    this.reprojSize_ = [Math.round(outWidth), Math.round(outHeight)];
    this.state = TileState_default.LOADED;
    this.changed();
  }
  /**
   * Load not yet loaded URI.
   * @override
   */
  load() {
    if (this.state !== TileState_default.IDLE && this.state !== TileState_default.ERROR) {
      return;
    }
    this.state = TileState_default.LOADING;
    this.changed();
    let leftToLoad = 0;
    this.sourcesListenerKeys_ = [];
    this.sourceTiles_.forEach(({
      tile
    }) => {
      const state = tile.getState();
      if (state !== TileState_default.IDLE && state !== TileState_default.LOADING) {
        return;
      }
      leftToLoad++;
      const sourceListenKey = listen(tile, EventType_default.CHANGE, () => {
        const state2 = tile.getState();
        if (state2 == TileState_default.LOADED || state2 == TileState_default.ERROR || state2 == TileState_default.EMPTY) {
          unlistenByKey(sourceListenKey);
          leftToLoad--;
          if (leftToLoad === 0) {
            this.unlistenSources_();
            this.reproject_();
          }
        }
      });
      this.sourcesListenerKeys_.push(sourceListenKey);
    });
    if (leftToLoad === 0) {
      setTimeout(this.reproject_.bind(this), 0);
    } else {
      this.sourceTiles_.forEach(function({
        tile
      }) {
        const state = tile.getState();
        if (state == TileState_default.IDLE) {
          tile.load();
        }
      });
    }
  }
  /**
   * @private
   */
  unlistenSources_() {
    this.sourcesListenerKeys_.forEach(unlistenByKey);
    this.sourcesListenerKeys_ = null;
  }
};
var DataTile_default2 = ReprojDataTile;

export {
  asImageLike,
  asArrayLike,
  DataTile_default,
  create,
  fromTransform,
  DataTile_default2
};
//# sourceMappingURL=chunk-PMSTMQL3.js.map
