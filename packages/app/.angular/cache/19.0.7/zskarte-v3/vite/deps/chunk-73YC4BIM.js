import {
  Feature_default as Feature_default2,
  transformGeometryWithOptions
} from "./chunk-VWKLSPS7.js";
import {
  Feature_default2 as Feature_default
} from "./chunk-3XNX3BQI.js";
import {
  MultiLineString_default,
  MultiPolygon_default
} from "./chunk-NRWZHYJK.js";
import {
  MultiPoint_default
} from "./chunk-4POCNJOL.js";
import {
  LineString_default
} from "./chunk-GK7HTIGR.js";
import {
  Polygon_default,
  inflateEnds
} from "./chunk-CPUVTREV.js";
import {
  Point_default
} from "./chunk-BYB6RSDC.js";
import {
  Projection_default,
  get3 as get
} from "./chunk-QPOUXWMH.js";

// ../../node_modules/pbf/index.js
var SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
var SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
var TEXT_DECODER_MIN_LENGTH = 12;
var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");
var PBF_VARINT = 0;
var PBF_FIXED64 = 1;
var PBF_BYTES = 2;
var PBF_FIXED32 = 5;
var Pbf = class {
  /**
   * @param {Uint8Array | ArrayBuffer} [buf]
   */
  constructor(buf = new Uint8Array(16)) {
    this.buf = ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf);
    this.dataView = new DataView(this.buf.buffer);
    this.pos = 0;
    this.type = 0;
    this.length = this.buf.length;
  }
  // === READING =================================================================
  /**
   * @template T
   * @param {(tag: number, result: T, pbf: Pbf) => void} readField
   * @param {T} result
   * @param {number} [end]
   */
  readFields(readField, result, end = this.length) {
    while (this.pos < end) {
      const val = this.readVarint(), tag = val >> 3, startPos = this.pos;
      this.type = val & 7;
      readField(tag, result, this);
      if (this.pos === startPos) this.skip(val);
    }
    return result;
  }
  /**
   * @template T
   * @param {(tag: number, result: T, pbf: Pbf) => void} readField
   * @param {T} result
   */
  readMessage(readField, result) {
    return this.readFields(readField, result, this.readVarint() + this.pos);
  }
  readFixed32() {
    const val = this.dataView.getUint32(this.pos, true);
    this.pos += 4;
    return val;
  }
  readSFixed32() {
    const val = this.dataView.getInt32(this.pos, true);
    this.pos += 4;
    return val;
  }
  // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)
  readFixed64() {
    const val = this.dataView.getUint32(this.pos, true) + this.dataView.getUint32(this.pos + 4, true) * SHIFT_LEFT_32;
    this.pos += 8;
    return val;
  }
  readSFixed64() {
    const val = this.dataView.getUint32(this.pos, true) + this.dataView.getInt32(this.pos + 4, true) * SHIFT_LEFT_32;
    this.pos += 8;
    return val;
  }
  readFloat() {
    const val = this.dataView.getFloat32(this.pos, true);
    this.pos += 4;
    return val;
  }
  readDouble() {
    const val = this.dataView.getFloat64(this.pos, true);
    this.pos += 8;
    return val;
  }
  /**
   * @param {boolean} [isSigned]
   */
  readVarint(isSigned) {
    const buf = this.buf;
    let val, b;
    b = buf[this.pos++];
    val = b & 127;
    if (b < 128) return val;
    b = buf[this.pos++];
    val |= (b & 127) << 7;
    if (b < 128) return val;
    b = buf[this.pos++];
    val |= (b & 127) << 14;
    if (b < 128) return val;
    b = buf[this.pos++];
    val |= (b & 127) << 21;
    if (b < 128) return val;
    b = buf[this.pos];
    val |= (b & 15) << 28;
    return readVarintRemainder(val, isSigned, this);
  }
  readVarint64() {
    return this.readVarint(true);
  }
  readSVarint() {
    const num = this.readVarint();
    return num % 2 === 1 ? (num + 1) / -2 : num / 2;
  }
  readBoolean() {
    return Boolean(this.readVarint());
  }
  readString() {
    const end = this.readVarint() + this.pos;
    const pos = this.pos;
    this.pos = end;
    if (end - pos >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
      return utf8TextDecoder.decode(this.buf.subarray(pos, end));
    }
    return readUtf8(this.buf, pos, end);
  }
  readBytes() {
    const end = this.readVarint() + this.pos, buffer = this.buf.subarray(this.pos, end);
    this.pos = end;
    return buffer;
  }
  // verbose for performance reasons; doesn't affect gzipped size
  /**
   * @param {number[]} [arr]
   * @param {boolean} [isSigned]
   */
  readPackedVarint(arr = [], isSigned) {
    const end = this.readPackedEnd();
    while (this.pos < end) arr.push(this.readVarint(isSigned));
    return arr;
  }
  /** @param {number[]} [arr] */
  readPackedSVarint(arr = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) arr.push(this.readSVarint());
    return arr;
  }
  /** @param {boolean[]} [arr] */
  readPackedBoolean(arr = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) arr.push(this.readBoolean());
    return arr;
  }
  /** @param {number[]} [arr] */
  readPackedFloat(arr = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) arr.push(this.readFloat());
    return arr;
  }
  /** @param {number[]} [arr] */
  readPackedDouble(arr = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) arr.push(this.readDouble());
    return arr;
  }
  /** @param {number[]} [arr] */
  readPackedFixed32(arr = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) arr.push(this.readFixed32());
    return arr;
  }
  /** @param {number[]} [arr] */
  readPackedSFixed32(arr = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) arr.push(this.readSFixed32());
    return arr;
  }
  /** @param {number[]} [arr] */
  readPackedFixed64(arr = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) arr.push(this.readFixed64());
    return arr;
  }
  /** @param {number[]} [arr] */
  readPackedSFixed64(arr = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) arr.push(this.readSFixed64());
    return arr;
  }
  readPackedEnd() {
    return this.type === PBF_BYTES ? this.readVarint() + this.pos : this.pos + 1;
  }
  /** @param {number} val */
  skip(val) {
    const type = val & 7;
    if (type === PBF_VARINT) while (this.buf[this.pos++] > 127) {
    }
    else if (type === PBF_BYTES) this.pos = this.readVarint() + this.pos;
    else if (type === PBF_FIXED32) this.pos += 4;
    else if (type === PBF_FIXED64) this.pos += 8;
    else throw new Error(`Unimplemented type: ${type}`);
  }
  // === WRITING =================================================================
  /**
   * @param {number} tag
   * @param {number} type
   */
  writeTag(tag, type) {
    this.writeVarint(tag << 3 | type);
  }
  /** @param {number} min */
  realloc(min) {
    let length = this.length || 16;
    while (length < this.pos + min) length *= 2;
    if (length !== this.length) {
      const buf = new Uint8Array(length);
      buf.set(this.buf);
      this.buf = buf;
      this.dataView = new DataView(buf.buffer);
      this.length = length;
    }
  }
  finish() {
    this.length = this.pos;
    this.pos = 0;
    return this.buf.subarray(0, this.length);
  }
  /** @param {number} val */
  writeFixed32(val) {
    this.realloc(4);
    this.dataView.setInt32(this.pos, val, true);
    this.pos += 4;
  }
  /** @param {number} val */
  writeSFixed32(val) {
    this.realloc(4);
    this.dataView.setInt32(this.pos, val, true);
    this.pos += 4;
  }
  /** @param {number} val */
  writeFixed64(val) {
    this.realloc(8);
    this.dataView.setInt32(this.pos, val & -1, true);
    this.dataView.setInt32(this.pos + 4, Math.floor(val * SHIFT_RIGHT_32), true);
    this.pos += 8;
  }
  /** @param {number} val */
  writeSFixed64(val) {
    this.realloc(8);
    this.dataView.setInt32(this.pos, val & -1, true);
    this.dataView.setInt32(this.pos + 4, Math.floor(val * SHIFT_RIGHT_32), true);
    this.pos += 8;
  }
  /** @param {number} val */
  writeVarint(val) {
    val = +val || 0;
    if (val > 268435455 || val < 0) {
      writeBigVarint(val, this);
      return;
    }
    this.realloc(4);
    this.buf[this.pos++] = val & 127 | (val > 127 ? 128 : 0);
    if (val <= 127) return;
    this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
    if (val <= 127) return;
    this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
    if (val <= 127) return;
    this.buf[this.pos++] = val >>> 7 & 127;
  }
  /** @param {number} val */
  writeSVarint(val) {
    this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
  }
  /** @param {boolean} val */
  writeBoolean(val) {
    this.writeVarint(+val);
  }
  /** @param {string} str */
  writeString(str) {
    str = String(str);
    this.realloc(str.length * 4);
    this.pos++;
    const startPos = this.pos;
    this.pos = writeUtf8(this.buf, str, this.pos);
    const len = this.pos - startPos;
    if (len >= 128) makeRoomForExtraLength(startPos, len, this);
    this.pos = startPos - 1;
    this.writeVarint(len);
    this.pos += len;
  }
  /** @param {number} val */
  writeFloat(val) {
    this.realloc(4);
    this.dataView.setFloat32(this.pos, val, true);
    this.pos += 4;
  }
  /** @param {number} val */
  writeDouble(val) {
    this.realloc(8);
    this.dataView.setFloat64(this.pos, val, true);
    this.pos += 8;
  }
  /** @param {Uint8Array} buffer */
  writeBytes(buffer) {
    const len = buffer.length;
    this.writeVarint(len);
    this.realloc(len);
    for (let i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
  }
  /**
   * @template T
   * @param {(obj: T, pbf: Pbf) => void} fn
   * @param {T} obj
   */
  writeRawMessage(fn, obj) {
    this.pos++;
    const startPos = this.pos;
    fn(obj, this);
    const len = this.pos - startPos;
    if (len >= 128) makeRoomForExtraLength(startPos, len, this);
    this.pos = startPos - 1;
    this.writeVarint(len);
    this.pos += len;
  }
  /**
   * @template T
   * @param {number} tag
   * @param {(obj: T, pbf: Pbf) => void} fn
   * @param {T} obj
   */
  writeMessage(tag, fn, obj) {
    this.writeTag(tag, PBF_BYTES);
    this.writeRawMessage(fn, obj);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedVarint(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedVarint, arr);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedSVarint(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);
  }
  /**
   * @param {number} tag
   * @param {boolean[]} arr
   */
  writePackedBoolean(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedFloat(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedFloat, arr);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedDouble(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedDouble, arr);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedFixed32(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedSFixed32(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedFixed64(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedSFixed64(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr);
  }
  /**
   * @param {number} tag
   * @param {Uint8Array} buffer
   */
  writeBytesField(tag, buffer) {
    this.writeTag(tag, PBF_BYTES);
    this.writeBytes(buffer);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeFixed32Field(tag, val) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeFixed32(val);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeSFixed32Field(tag, val) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeSFixed32(val);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeFixed64Field(tag, val) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeFixed64(val);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeSFixed64Field(tag, val) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeSFixed64(val);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeVarintField(tag, val) {
    this.writeTag(tag, PBF_VARINT);
    this.writeVarint(val);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeSVarintField(tag, val) {
    this.writeTag(tag, PBF_VARINT);
    this.writeSVarint(val);
  }
  /**
   * @param {number} tag
   * @param {string} str
   */
  writeStringField(tag, str) {
    this.writeTag(tag, PBF_BYTES);
    this.writeString(str);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeFloatField(tag, val) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeFloat(val);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeDoubleField(tag, val) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeDouble(val);
  }
  /**
   * @param {number} tag
   * @param {boolean} val
   */
  writeBooleanField(tag, val) {
    this.writeVarintField(tag, +val);
  }
};
function readVarintRemainder(l, s, p) {
  const buf = p.buf;
  let h, b;
  b = buf[p.pos++];
  h = (b & 112) >> 4;
  if (b < 128) return toNum(l, h, s);
  b = buf[p.pos++];
  h |= (b & 127) << 3;
  if (b < 128) return toNum(l, h, s);
  b = buf[p.pos++];
  h |= (b & 127) << 10;
  if (b < 128) return toNum(l, h, s);
  b = buf[p.pos++];
  h |= (b & 127) << 17;
  if (b < 128) return toNum(l, h, s);
  b = buf[p.pos++];
  h |= (b & 127) << 24;
  if (b < 128) return toNum(l, h, s);
  b = buf[p.pos++];
  h |= (b & 1) << 31;
  if (b < 128) return toNum(l, h, s);
  throw new Error("Expected varint not more than 10 bytes");
}
function toNum(low, high, isSigned) {
  return isSigned ? high * 4294967296 + (low >>> 0) : (high >>> 0) * 4294967296 + (low >>> 0);
}
function writeBigVarint(val, pbf) {
  let low, high;
  if (val >= 0) {
    low = val % 4294967296 | 0;
    high = val / 4294967296 | 0;
  } else {
    low = ~(-val % 4294967296);
    high = ~(-val / 4294967296);
    if (low ^ 4294967295) {
      low = low + 1 | 0;
    } else {
      low = 0;
      high = high + 1 | 0;
    }
  }
  if (val >= 18446744073709552e3 || val < -18446744073709552e3) {
    throw new Error("Given varint doesn't fit into 10 bytes");
  }
  pbf.realloc(10);
  writeBigVarintLow(low, high, pbf);
  writeBigVarintHigh(high, pbf);
}
function writeBigVarintLow(low, high, pbf) {
  pbf.buf[pbf.pos++] = low & 127 | 128;
  low >>>= 7;
  pbf.buf[pbf.pos++] = low & 127 | 128;
  low >>>= 7;
  pbf.buf[pbf.pos++] = low & 127 | 128;
  low >>>= 7;
  pbf.buf[pbf.pos++] = low & 127 | 128;
  low >>>= 7;
  pbf.buf[pbf.pos] = low & 127;
}
function writeBigVarintHigh(high, pbf) {
  const lsb = (high & 7) << 4;
  pbf.buf[pbf.pos++] |= lsb | ((high >>>= 3) ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 127;
}
function makeRoomForExtraLength(startPos, len, pbf) {
  const extraLen = len <= 16383 ? 1 : len <= 2097151 ? 2 : len <= 268435455 ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7));
  pbf.realloc(extraLen);
  for (let i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
}
function writePackedVarint(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);
}
function writePackedSVarint(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);
}
function writePackedFloat(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);
}
function writePackedDouble(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);
}
function writePackedBoolean(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);
}
function writePackedFixed32(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);
}
function writePackedSFixed32(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]);
}
function writePackedFixed64(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);
}
function writePackedSFixed64(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]);
}
function readUtf8(buf, pos, end) {
  let str = "";
  let i = pos;
  while (i < end) {
    const b0 = buf[i];
    let c = null;
    let bytesPerSequence = b0 > 239 ? 4 : b0 > 223 ? 3 : b0 > 191 ? 2 : 1;
    if (i + bytesPerSequence > end) break;
    let b1, b2, b3;
    if (bytesPerSequence === 1) {
      if (b0 < 128) {
        c = b0;
      }
    } else if (bytesPerSequence === 2) {
      b1 = buf[i + 1];
      if ((b1 & 192) === 128) {
        c = (b0 & 31) << 6 | b1 & 63;
        if (c <= 127) {
          c = null;
        }
      }
    } else if (bytesPerSequence === 3) {
      b1 = buf[i + 1];
      b2 = buf[i + 2];
      if ((b1 & 192) === 128 && (b2 & 192) === 128) {
        c = (b0 & 15) << 12 | (b1 & 63) << 6 | b2 & 63;
        if (c <= 2047 || c >= 55296 && c <= 57343) {
          c = null;
        }
      }
    } else if (bytesPerSequence === 4) {
      b1 = buf[i + 1];
      b2 = buf[i + 2];
      b3 = buf[i + 3];
      if ((b1 & 192) === 128 && (b2 & 192) === 128 && (b3 & 192) === 128) {
        c = (b0 & 15) << 18 | (b1 & 63) << 12 | (b2 & 63) << 6 | b3 & 63;
        if (c <= 65535 || c >= 1114112) {
          c = null;
        }
      }
    }
    if (c === null) {
      c = 65533;
      bytesPerSequence = 1;
    } else if (c > 65535) {
      c -= 65536;
      str += String.fromCharCode(c >>> 10 & 1023 | 55296);
      c = 56320 | c & 1023;
    }
    str += String.fromCharCode(c);
    i += bytesPerSequence;
  }
  return str;
}
function writeUtf8(buf, str, pos) {
  for (let i = 0, c, lead; i < str.length; i++) {
    c = str.charCodeAt(i);
    if (c > 55295 && c < 57344) {
      if (lead) {
        if (c < 56320) {
          buf[pos++] = 239;
          buf[pos++] = 191;
          buf[pos++] = 189;
          lead = c;
          continue;
        } else {
          c = lead - 55296 << 10 | c - 56320 | 65536;
          lead = null;
        }
      } else {
        if (c > 56319 || i + 1 === str.length) {
          buf[pos++] = 239;
          buf[pos++] = 191;
          buf[pos++] = 189;
        } else {
          lead = c;
        }
        continue;
      }
    } else if (lead) {
      buf[pos++] = 239;
      buf[pos++] = 191;
      buf[pos++] = 189;
      lead = null;
    }
    if (c < 128) {
      buf[pos++] = c;
    } else {
      if (c < 2048) {
        buf[pos++] = c >> 6 | 192;
      } else {
        if (c < 65536) {
          buf[pos++] = c >> 12 | 224;
        } else {
          buf[pos++] = c >> 18 | 240;
          buf[pos++] = c >> 12 & 63 | 128;
        }
        buf[pos++] = c >> 6 & 63 | 128;
      }
      buf[pos++] = c & 63 | 128;
    }
  }
  return pos;
}

// ../../node_modules/ol/format/MVT.js
var MVT = class extends Feature_default2 {
  /**
   * @param {Options<FeatureType>} [options] Options.
   */
  constructor(options) {
    super();
    options = options ? options : {};
    this.dataProjection = new Projection_default({
      code: "",
      units: "tile-pixels"
    });
    this.featureClass = options.featureClass ? options.featureClass : (
      /** @type {import('./Feature.js').FeatureToFeatureClass<FeatureType>} */
      Feature_default
    );
    this.geometryName_ = options.geometryName;
    this.layerName_ = options.layerName ? options.layerName : "layer";
    this.layers_ = options.layers ? options.layers : null;
    this.idProperty_ = options.idProperty;
    this.supportedMediaTypes = ["application/vnd.mapbox-vector-tile", "application/x-protobuf"];
  }
  /**
   * Read the raw geometry from the pbf offset stored in a raw feature's geometry
   * property.
   * @param {PBF} pbf PBF.
   * @param {Object} feature Raw feature.
   * @param {Array<number>} flatCoordinates Array to store flat coordinates in.
   * @param {Array<number>} ends Array to store ends in.
   * @private
   */
  readRawGeometry_(pbf, feature, flatCoordinates, ends) {
    pbf.pos = feature.geometry;
    const end = pbf.readVarint() + pbf.pos;
    let cmd = 1;
    let length = 0;
    let x = 0;
    let y = 0;
    let coordsLen = 0;
    let currentEnd = 0;
    while (pbf.pos < end) {
      if (!length) {
        const cmdLen = pbf.readVarint();
        cmd = cmdLen & 7;
        length = cmdLen >> 3;
      }
      length--;
      if (cmd === 1 || cmd === 2) {
        x += pbf.readSVarint();
        y += pbf.readSVarint();
        if (cmd === 1) {
          if (coordsLen > currentEnd) {
            ends.push(coordsLen);
            currentEnd = coordsLen;
          }
        }
        flatCoordinates.push(x, y);
        coordsLen += 2;
      } else if (cmd === 7) {
        if (coordsLen > currentEnd) {
          flatCoordinates.push(flatCoordinates[currentEnd], flatCoordinates[currentEnd + 1]);
          coordsLen += 2;
        }
      } else {
        throw new Error("Invalid command found in the PBF");
      }
    }
    if (coordsLen > currentEnd) {
      ends.push(coordsLen);
      currentEnd = coordsLen;
    }
  }
  /**
   * @private
   * @param {PBF} pbf PBF
   * @param {Object} rawFeature Raw Mapbox feature.
   * @param {import("./Feature.js").ReadOptions} options Read options.
   * @return {FeatureType|null} Feature.
   */
  createFeature_(pbf, rawFeature, options) {
    const type = rawFeature.type;
    if (type === 0) {
      return null;
    }
    let feature;
    const values = rawFeature.properties;
    let id;
    if (!this.idProperty_) {
      id = rawFeature.id;
    } else {
      id = values[this.idProperty_];
      delete values[this.idProperty_];
    }
    values[this.layerName_] = rawFeature.layer.name;
    const flatCoordinates = (
      /** @type {Array<number>} */
      []
    );
    const ends = (
      /** @type {Array<number>} */
      []
    );
    this.readRawGeometry_(pbf, rawFeature, flatCoordinates, ends);
    const geometryType = getGeometryType(type, ends.length);
    if (this.featureClass === Feature_default) {
      feature = new /** @type {import('./Feature.js').FeatureToFeatureClass<RenderFeature>} */
      this.featureClass(geometryType, flatCoordinates, ends, 2, values, id);
      feature.transform(options.dataProjection);
    } else {
      let geom;
      if (geometryType == "Polygon") {
        const endss = inflateEnds(flatCoordinates, ends);
        geom = endss.length > 1 ? new MultiPolygon_default(flatCoordinates, "XY", endss) : new Polygon_default(flatCoordinates, "XY", ends);
      } else {
        geom = geometryType === "Point" ? new Point_default(flatCoordinates, "XY") : geometryType === "LineString" ? new LineString_default(flatCoordinates, "XY") : geometryType === "MultiPoint" ? new MultiPoint_default(flatCoordinates, "XY") : geometryType === "MultiLineString" ? new MultiLineString_default(flatCoordinates, "XY", ends) : null;
      }
      const ctor = (
        /** @type {typeof import("../Feature.js").default} */
        this.featureClass
      );
      feature = new ctor();
      if (this.geometryName_) {
        feature.setGeometryName(this.geometryName_);
      }
      const geometry = transformGeometryWithOptions(geom, false, options);
      feature.setGeometry(geometry);
      if (id !== void 0) {
        feature.setId(id);
      }
      feature.setProperties(values, true);
    }
    return (
      /** @type {FeatureType} */
      feature
    );
  }
  /**
   * @return {import("./Feature.js").Type} Format.
   * @override
   */
  getType() {
    return "arraybuffer";
  }
  /**
   * Read all features.
   *
   * @param {ArrayBuffer} source Source.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @return {Array<FeatureType>} Features.
   * @api
   * @override
   */
  readFeatures(source, options) {
    const layers = this.layers_;
    options = this.adaptOptions(options);
    const dataProjection = get(options.dataProjection);
    dataProjection.setWorldExtent(options.extent);
    options.dataProjection = dataProjection;
    const pbf = new Pbf(
      /** @type {ArrayBuffer} */
      source
    );
    const pbfLayers = pbf.readFields(layersPBFReader, {});
    const features = [];
    for (const name in pbfLayers) {
      if (layers && !layers.includes(name)) {
        continue;
      }
      const pbfLayer = pbfLayers[name];
      const extent = pbfLayer ? [0, 0, pbfLayer.extent, pbfLayer.extent] : null;
      dataProjection.setExtent(extent);
      for (let i = 0, ii = pbfLayer.length; i < ii; ++i) {
        const rawFeature = readRawFeature(pbf, pbfLayer, i);
        const feature = this.createFeature_(pbf, rawFeature, options);
        if (feature !== null) {
          features.push(feature);
        }
      }
    }
    return (
      /** @type {Array<FeatureType>} */
      features
    );
  }
  /**
   * Read the projection from the source.
   *
   * @param {Document|Element|Object|string} source Source.
   * @return {import("../proj/Projection.js").default} Projection.
   * @api
   * @override
   */
  readProjection(source) {
    return this.dataProjection;
  }
  /**
   * Sets the layers that features will be read from.
   * @param {Array<string>} layers Layers.
   * @api
   */
  setLayers(layers) {
    this.layers_ = layers;
  }
};
function layersPBFReader(tag, layers, pbf) {
  if (tag === 3) {
    const layer = {
      keys: [],
      values: [],
      features: []
    };
    const end = pbf.readVarint() + pbf.pos;
    pbf.readFields(layerPBFReader, layer, end);
    layer.length = layer.features.length;
    if (layer.length) {
      layers[layer.name] = layer;
    }
  }
}
function layerPBFReader(tag, layer, pbf) {
  if (tag === 15) {
    layer.version = pbf.readVarint();
  } else if (tag === 1) {
    layer.name = pbf.readString();
  } else if (tag === 5) {
    layer.extent = pbf.readVarint();
  } else if (tag === 2) {
    layer.features.push(pbf.pos);
  } else if (tag === 3) {
    layer.keys.push(pbf.readString());
  } else if (tag === 4) {
    let value = null;
    const end = pbf.readVarint() + pbf.pos;
    while (pbf.pos < end) {
      tag = pbf.readVarint() >> 3;
      value = tag === 1 ? pbf.readString() : tag === 2 ? pbf.readFloat() : tag === 3 ? pbf.readDouble() : tag === 4 ? pbf.readVarint64() : tag === 5 ? pbf.readVarint() : tag === 6 ? pbf.readSVarint() : tag === 7 ? pbf.readBoolean() : null;
    }
    layer.values.push(value);
  }
}
function featurePBFReader(tag, feature, pbf) {
  if (tag == 1) {
    feature.id = pbf.readVarint();
  } else if (tag == 2) {
    const end = pbf.readVarint() + pbf.pos;
    while (pbf.pos < end) {
      const key = feature.layer.keys[pbf.readVarint()];
      const value = feature.layer.values[pbf.readVarint()];
      feature.properties[key] = value;
    }
  } else if (tag == 3) {
    feature.type = pbf.readVarint();
  } else if (tag == 4) {
    feature.geometry = pbf.pos;
  }
}
function readRawFeature(pbf, layer, i) {
  pbf.pos = layer.features[i];
  const end = pbf.readVarint() + pbf.pos;
  const feature = {
    layer,
    type: 0,
    properties: {}
  };
  pbf.readFields(featurePBFReader, feature, end);
  return feature;
}
function getGeometryType(type, numEnds) {
  let geometryType;
  if (type === 1) {
    geometryType = numEnds === 1 ? "Point" : "MultiPoint";
  } else if (type === 2) {
    geometryType = numEnds === 1 ? "LineString" : "MultiLineString";
  } else if (type === 3) {
    geometryType = "Polygon";
  }
  return geometryType;
}
var MVT_default = MVT;

export {
  MVT_default
};
//# sourceMappingURL=chunk-73YC4BIM.js.map
