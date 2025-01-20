import {
  clamp
} from "./chunk-3IATBWUD.js";

// ../../node_modules/color-space/rgb.js
var rgb_default = {
  name: "rgb",
  min: [0, 0, 0],
  max: [255, 255, 255],
  channel: ["red", "green", "blue"],
  alias: ["RGB"]
};

// ../../node_modules/color-space/xyz.js
var xyz = {
  name: "xyz",
  min: [0, 0, 0],
  channel: ["X", "Y", "Z"],
  alias: ["XYZ", "ciexyz", "cie1931"]
};
xyz.whitepoint = {
  //1931 2°
  2: {
    //incadescent
    A: [109.85, 100, 35.585],
    // B:[],
    C: [98.074, 100, 118.232],
    D50: [96.422, 100, 82.521],
    D55: [95.682, 100, 92.149],
    //daylight
    D65: [95.045592705167, 100, 108.9057750759878],
    D75: [94.972, 100, 122.638],
    //flourescent
    // F1: [],
    F2: [99.187, 100, 67.395],
    // F3: [],
    // F4: [],
    // F5: [],
    // F6:[],
    F7: [95.044, 100, 108.755],
    // F8: [],
    // F9: [],
    // F10: [],
    F11: [100.966, 100, 64.37],
    // F12: [],
    E: [100, 100, 100]
  },
  //1964  10°
  10: {
    //incadescent
    A: [111.144, 100, 35.2],
    C: [97.285, 100, 116.145],
    D50: [96.72, 100, 81.427],
    D55: [95.799, 100, 90.926],
    //daylight
    D65: [94.811, 100, 107.304],
    D75: [94.416, 100, 120.641],
    //flourescent
    F2: [103.28, 100, 69.026],
    F7: [95.792, 100, 107.687],
    F11: [103.866, 100, 65.627],
    E: [100, 100, 100]
  }
};
xyz.max = xyz.whitepoint[2].D65;
xyz.rgb = function(_xyz, white) {
  white = white || xyz.whitepoint[2].E;
  var x = _xyz[0] / white[0], y = _xyz[1] / white[1], z = _xyz[2] / white[2], r, g, b;
  r = x * 3.240969941904521 + y * -1.537383177570093 + z * -0.498610760293;
  g = x * -0.96924363628087 + y * 1.87596750150772 + z * 0.041555057407175;
  b = x * 0.055630079696993 + y * -0.20397695888897 + z * 1.056971514242878;
  r = r > 31308e-7 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : r = r * 12.92;
  g = g > 31308e-7 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : g = g * 12.92;
  b = b > 31308e-7 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : b = b * 12.92;
  r = Math.min(Math.max(0, r), 1);
  g = Math.min(Math.max(0, g), 1);
  b = Math.min(Math.max(0, b), 1);
  return [r * 255, g * 255, b * 255];
};
rgb_default.xyz = function(rgb, white) {
  var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  var x = r * 0.41239079926595 + g * 0.35758433938387 + b * 0.18048078840183;
  var y = r * 0.21263900587151 + g * 0.71516867876775 + b * 0.072192315360733;
  var z = r * 0.019330818715591 + g * 0.11919477979462 + b * 0.95053215224966;
  white = white || xyz.whitepoint[2].E;
  return [x * white[0], y * white[1], z * white[2]];
};
var xyz_default = xyz;

// ../../node_modules/color-space/luv.js
var luv_default = {
  name: "luv",
  //NOTE: luv has no rigidly defined limits
  //easyrgb fails to get proper coords
  //boronine states no rigid limits
  //colorMine refers this ones:
  min: [0, -134, -140],
  max: [100, 224, 122],
  channel: ["lightness", "u", "v"],
  alias: ["LUV", "cieluv", "cie1976"],
  xyz: function(arg, i, o) {
    var _u, _v, l, u, v, x, y, z, xn, yn, zn, un, vn;
    l = arg[0], u = arg[1], v = arg[2];
    if (l === 0) return [0, 0, 0];
    var k = 0.0011070564598794539;
    i = i || "D65";
    o = o || 2;
    xn = xyz_default.whitepoint[o][i][0];
    yn = xyz_default.whitepoint[o][i][1];
    zn = xyz_default.whitepoint[o][i][2];
    un = 4 * xn / (xn + 15 * yn + 3 * zn);
    vn = 9 * yn / (xn + 15 * yn + 3 * zn);
    _u = u / (13 * l) + un || 0;
    _v = v / (13 * l) + vn || 0;
    y = l > 8 ? yn * Math.pow((l + 16) / 116, 3) : yn * l * k;
    x = y * 9 * _u / (4 * _v) || 0;
    z = y * (12 - 3 * _u - 20 * _v) / (4 * _v) || 0;
    return [x, y, z];
  }
};
xyz_default.luv = function(arg, i, o) {
  var _u, _v, l, u, v, x, y, z, xn, yn, zn, un, vn;
  var e = 0.008856451679035631;
  var k = 903.2962962962961;
  i = i || "D65";
  o = o || 2;
  xn = xyz_default.whitepoint[o][i][0];
  yn = xyz_default.whitepoint[o][i][1];
  zn = xyz_default.whitepoint[o][i][2];
  un = 4 * xn / (xn + 15 * yn + 3 * zn);
  vn = 9 * yn / (xn + 15 * yn + 3 * zn);
  x = arg[0], y = arg[1], z = arg[2];
  _u = 4 * x / (x + 15 * y + 3 * z) || 0;
  _v = 9 * y / (x + 15 * y + 3 * z) || 0;
  var yr = y / yn;
  l = yr <= e ? k * yr : 116 * Math.pow(yr, 1 / 3) - 16;
  u = 13 * l * (_u - un);
  v = 13 * l * (_v - vn);
  return [l, u, v];
};

// ../../node_modules/color-space/lchuv.js
var lchuv = {
  name: "lchuv",
  channel: ["lightness", "chroma", "hue"],
  alias: ["LCHuv", "cielchuv"],
  min: [0, 0, 0],
  max: [100, 100, 360],
  luv: function(luv) {
    var l = luv[0], c = luv[1], h = luv[2], u, v, hr;
    hr = h / 360 * 2 * Math.PI;
    u = c * Math.cos(hr);
    v = c * Math.sin(hr);
    return [l, u, v];
  },
  xyz: function(arg) {
    return luv_default.xyz(lchuv.luv(arg));
  }
};
var lchuv_default = lchuv;
luv_default.lchuv = function(luv) {
  var l = luv[0], u = luv[1], v = luv[2];
  var c = Math.sqrt(u * u + v * v);
  var hr = Math.atan2(v, u);
  var h = hr * 360 / 2 / Math.PI;
  if (h < 0) {
    h += 360;
  }
  return [l, c, h];
};
xyz_default.lchuv = function(arg) {
  return luv_default.lchuv(xyz_default.luv(arg));
};

// ../../node_modules/color-parse/node_modules/color-name/index.js
var color_name_default = {
  aliceblue: [240, 248, 255],
  antiquewhite: [250, 235, 215],
  aqua: [0, 255, 255],
  aquamarine: [127, 255, 212],
  azure: [240, 255, 255],
  beige: [245, 245, 220],
  bisque: [255, 228, 196],
  black: [0, 0, 0],
  blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255],
  blueviolet: [138, 43, 226],
  brown: [165, 42, 42],
  burlywood: [222, 184, 135],
  cadetblue: [95, 158, 160],
  chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30],
  coral: [255, 127, 80],
  cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220],
  crimson: [220, 20, 60],
  cyan: [0, 255, 255],
  darkblue: [0, 0, 139],
  darkcyan: [0, 139, 139],
  darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169],
  darkgreen: [0, 100, 0],
  darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107],
  darkmagenta: [139, 0, 139],
  darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0],
  darkorchid: [153, 50, 204],
  darkred: [139, 0, 0],
  darksalmon: [233, 150, 122],
  darkseagreen: [143, 188, 143],
  darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211],
  deeppink: [255, 20, 147],
  deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34],
  floralwhite: [255, 250, 240],
  forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255],
  gainsboro: [220, 220, 220],
  ghostwhite: [248, 248, 255],
  gold: [255, 215, 0],
  goldenrod: [218, 165, 32],
  gray: [128, 128, 128],
  green: [0, 128, 0],
  greenyellow: [173, 255, 47],
  grey: [128, 128, 128],
  honeydew: [240, 255, 240],
  hotpink: [255, 105, 180],
  indianred: [205, 92, 92],
  indigo: [75, 0, 130],
  ivory: [255, 255, 240],
  khaki: [240, 230, 140],
  lavender: [230, 230, 250],
  lavenderblush: [255, 240, 245],
  lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205],
  lightblue: [173, 216, 230],
  lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255],
  lightgoldenrodyellow: [250, 250, 210],
  lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122],
  lightseagreen: [32, 178, 170],
  lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153],
  lightslategrey: [119, 136, 153],
  lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224],
  lime: [0, 255, 0],
  limegreen: [50, 205, 50],
  linen: [250, 240, 230],
  magenta: [255, 0, 255],
  maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170],
  mediumblue: [0, 0, 205],
  mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219],
  mediumseagreen: [60, 179, 113],
  mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154],
  mediumturquoise: [72, 209, 204],
  mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181],
  navajowhite: [255, 222, 173],
  navy: [0, 0, 128],
  oldlace: [253, 245, 230],
  olive: [128, 128, 0],
  olivedrab: [107, 142, 35],
  orange: [255, 165, 0],
  orangered: [255, 69, 0],
  orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170],
  palegreen: [152, 251, 152],
  paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147],
  papayawhip: [255, 239, 213],
  peachpuff: [255, 218, 185],
  peru: [205, 133, 63],
  pink: [255, 192, 203],
  plum: [221, 160, 221],
  powderblue: [176, 224, 230],
  purple: [128, 0, 128],
  rebeccapurple: [102, 51, 153],
  red: [255, 0, 0],
  rosybrown: [188, 143, 143],
  royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19],
  salmon: [250, 128, 114],
  sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87],
  seashell: [255, 245, 238],
  sienna: [160, 82, 45],
  silver: [192, 192, 192],
  skyblue: [135, 206, 235],
  slateblue: [106, 90, 205],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  snow: [255, 250, 250],
  springgreen: [0, 255, 127],
  steelblue: [70, 130, 180],
  tan: [210, 180, 140],
  teal: [0, 128, 128],
  thistle: [216, 191, 216],
  tomato: [255, 99, 71],
  turquoise: [64, 224, 208],
  violet: [238, 130, 238],
  wheat: [245, 222, 179],
  white: [255, 255, 255],
  whitesmoke: [245, 245, 245],
  yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50]
};

// ../../node_modules/color-parse/index.js
var color_parse_default = parse;
var baseHues = {
  red: 0,
  orange: 60,
  yellow: 120,
  green: 180,
  blue: 240,
  purple: 300
};
function parse(cstr) {
  var m, parts = [], alpha = 1, space;
  if (typeof cstr === "number") {
    return {
      space: "rgb",
      values: [cstr >>> 16, (cstr & 65280) >>> 8, cstr & 255],
      alpha: 1
    };
  }
  if (typeof cstr === "number") return {
    space: "rgb",
    values: [cstr >>> 16, (cstr & 65280) >>> 8, cstr & 255],
    alpha: 1
  };
  cstr = String(cstr).toLowerCase();
  if (color_name_default[cstr]) {
    parts = color_name_default[cstr].slice();
    space = "rgb";
  } else if (cstr === "transparent") {
    alpha = 0;
    space = "rgb";
    parts = [0, 0, 0];
  } else if (cstr[0] === "#") {
    var base = cstr.slice(1);
    var size = base.length;
    var isShort = size <= 4;
    alpha = 1;
    if (isShort) {
      parts = [parseInt(base[0] + base[0], 16), parseInt(base[1] + base[1], 16), parseInt(base[2] + base[2], 16)];
      if (size === 4) {
        alpha = parseInt(base[3] + base[3], 16) / 255;
      }
    } else {
      parts = [parseInt(base[0] + base[1], 16), parseInt(base[2] + base[3], 16), parseInt(base[4] + base[5], 16)];
      if (size === 8) {
        alpha = parseInt(base[6] + base[7], 16) / 255;
      }
    }
    if (!parts[0]) parts[0] = 0;
    if (!parts[1]) parts[1] = 0;
    if (!parts[2]) parts[2] = 0;
    space = "rgb";
  } else if (m = /^((?:rgba?|hs[lvb]a?|hwba?|cmyk?|xy[zy]|gray|lab|lchu?v?|[ly]uv|lms|oklch|oklab|color))\s*\(([^\)]*)\)/.exec(cstr)) {
    var name = m[1];
    space = name.replace(/a$/, "");
    var dims = space === "cmyk" ? 4 : space === "gray" ? 1 : 3;
    parts = m[2].trim().split(/\s*[,\/]\s*|\s+/);
    if (space === "color") space = parts.shift();
    parts = parts.map(function(x, i) {
      if (x[x.length - 1] === "%") {
        x = parseFloat(x) / 100;
        if (i === 3) return x;
        if (space === "rgb") return x * 255;
        if (space[0] === "h") return x * 100;
        if (space[0] === "l" && !i) return x * 100;
        if (space === "lab") return x * 125;
        if (space === "lch") return i < 2 ? x * 150 : x * 360;
        if (space[0] === "o" && !i) return x;
        if (space === "oklab") return x * 0.4;
        if (space === "oklch") return i < 2 ? x * 0.4 : x * 360;
        return x;
      }
      if (space[i] === "h" || i === 2 && space[space.length - 1] === "h") {
        if (baseHues[x] !== void 0) return baseHues[x];
        if (x.endsWith("deg")) return parseFloat(x);
        if (x.endsWith("turn")) return parseFloat(x) * 360;
        if (x.endsWith("grad")) return parseFloat(x) * 360 / 400;
        if (x.endsWith("rad")) return parseFloat(x) * 180 / Math.PI;
      }
      if (x === "none") return 0;
      return parseFloat(x);
    });
    alpha = parts.length > dims ? parts.pop() : 1;
  } else if (/[0-9](?:\s|\/|,)/.test(cstr)) {
    parts = cstr.match(/([0-9]+)/g).map(function(value) {
      return parseFloat(value);
    });
    space = cstr.match(/([a-z])/ig)?.join("")?.toLowerCase() || "rgb";
  }
  return {
    space,
    values: parts,
    alpha
  };
}

// ../../node_modules/color-space/hsl.js
var hsl_default = {
  name: "hsl",
  min: [0, 0, 0],
  max: [360, 100, 100],
  channel: ["hue", "saturation", "lightness"],
  alias: ["HSL"],
  rgb: function(hsl) {
    var h = hsl[0] / 360, s = hsl[1] / 100, l = hsl[2] / 100, t1, t2, t3, rgb, val, i = 0;
    if (s === 0) return val = l * 255, [val, val, val];
    t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
    t1 = 2 * l - t2;
    rgb = [0, 0, 0];
    for (; i < 3; ) {
      t3 = h + 1 / 3 * -(i - 1);
      t3 < 0 ? t3++ : t3 > 1 && t3--;
      val = 6 * t3 < 1 ? t1 + (t2 - t1) * 6 * t3 : 2 * t3 < 1 ? t2 : 3 * t3 < 2 ? t1 + (t2 - t1) * (2 / 3 - t3) * 6 : t1;
      rgb[i++] = val * 255;
    }
    return rgb;
  }
};
rgb_default.hsl = function(rgb) {
  var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h, s, l;
  if (max === min) {
    h = 0;
  } else if (r === max) {
    h = (g - b) / delta;
  } else if (g === max) {
    h = 2 + (b - r) / delta;
  } else if (b === max) {
    h = 4 + (r - g) / delta;
  }
  h = Math.min(h * 60, 360);
  if (h < 0) {
    h += 360;
  }
  l = (min + max) / 2;
  if (max === min) {
    s = 0;
  } else if (l <= 0.5) {
    s = delta / (max + min);
  } else {
    s = delta / (2 - max - min);
  }
  return [h, s * 100, l * 100];
};

// ../../node_modules/color-rgba/index.js
function rgba(color) {
  if (Array.isArray(color) && color.raw) color = String.raw(...arguments);
  if (color instanceof Number) color = +color;
  var values, i, l;
  var parsed = color_parse_default(color);
  if (!parsed.space) return [];
  const min = parsed.space[0] === "h" ? hsl_default.min : rgb_default.min;
  const max = parsed.space[0] === "h" ? hsl_default.max : rgb_default.max;
  values = Array(3);
  values[0] = Math.min(Math.max(parsed.values[0], min[0]), max[0]);
  values[1] = Math.min(Math.max(parsed.values[1], min[1]), max[1]);
  values[2] = Math.min(Math.max(parsed.values[2], min[2]), max[2]);
  if (parsed.space[0] === "h") {
    values = hsl_default.rgb(values);
  }
  values.push(Math.min(Math.max(parsed.alpha, 0), 1));
  return values;
}

// ../../node_modules/ol/color.js
var NO_COLOR = [NaN, NaN, NaN, 0];
function asString(color) {
  if (typeof color === "string") {
    return color;
  }
  return toString(color);
}
var MAX_CACHE_SIZE = 1024;
var cache = {};
var cacheSize = 0;
function withAlpha(color) {
  if (color.length === 4) {
    return color;
  }
  const output = color.slice();
  output[3] = 1;
  return output;
}
function rgbaToLcha(color) {
  const output = xyz_default.lchuv(rgb_default.xyz(color));
  output[3] = color[3];
  return output;
}
function lchaToRgba(color) {
  const output = xyz_default.rgb(lchuv_default.xyz(color));
  output[3] = color[3];
  return output;
}
function fromString(s) {
  if (s === "none") {
    return NO_COLOR;
  }
  if (cache.hasOwnProperty(s)) {
    return cache[s];
  }
  if (cacheSize >= MAX_CACHE_SIZE) {
    let i = 0;
    for (const key in cache) {
      if ((i++ & 3) === 0) {
        delete cache[key];
        --cacheSize;
      }
    }
  }
  const color = rgba(s);
  if (color.length !== 4) {
    throw new Error('failed to parse "' + s + '" as color');
  }
  for (const c of color) {
    if (isNaN(c)) {
      throw new Error('failed to parse "' + s + '" as color');
    }
  }
  normalize(color);
  cache[s] = color;
  ++cacheSize;
  return color;
}
function asArray(color) {
  if (Array.isArray(color)) {
    return color;
  }
  return fromString(color);
}
function normalize(color) {
  color[0] = clamp(color[0] + 0.5 | 0, 0, 255);
  color[1] = clamp(color[1] + 0.5 | 0, 0, 255);
  color[2] = clamp(color[2] + 0.5 | 0, 0, 255);
  color[3] = clamp(color[3], 0, 1);
  return color;
}
function toString(color) {
  let r = color[0];
  if (r != (r | 0)) {
    r = r + 0.5 | 0;
  }
  let g = color[1];
  if (g != (g | 0)) {
    g = g + 0.5 | 0;
  }
  let b = color[2];
  if (b != (b | 0)) {
    b = b + 0.5 | 0;
  }
  const a = color[3] === void 0 ? 1 : Math.round(color[3] * 1e3) / 1e3;
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

export {
  NO_COLOR,
  asString,
  withAlpha,
  rgbaToLcha,
  lchaToRgba,
  fromString,
  asArray,
  normalize,
  toString
};
//# sourceMappingURL=chunk-QABMMYJI.js.map
