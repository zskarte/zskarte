import {
  __commonJS
} from "./chunk-NJ4VOZBH.js";

// ../types/dist/i18n/interfaces.js
var require_interfaces = __commonJS({
  "../types/dist/i18n/interfaces.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.DEFAULT_LOCALE = exports.LOCALES = void 0;
    exports.LOCALES = ["de", "fr", "en"];
    exports.DEFAULT_LOCALE = exports.LOCALES[0];
  }
});

// ../types/dist/map-layer/interfaces.js
var require_interfaces2 = __commonJS({
  "../types/dist/map-layer/interfaces.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
  }
});

// ../types/dist/operation/interfaces.js
var require_interfaces3 = __commonJS({
  "../types/dist/operation/interfaces.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
  }
});

// ../types/dist/session/interfaces.js
var require_interfaces4 = __commonJS({
  "../types/dist/session/interfaces.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.AccessTokenType = exports.PermissionType = void 0;
    var PermissionType;
    (function(PermissionType2) {
      PermissionType2["READ"] = "read";
      PermissionType2["WRITE"] = "write";
      PermissionType2["ALL"] = "all";
    })(PermissionType || (exports.PermissionType = PermissionType = {}));
    var AccessTokenType;
    (function(AccessTokenType2) {
      AccessTokenType2["LONG"] = "long";
      AccessTokenType2["SHORT"] = "short";
    })(AccessTokenType || (exports.AccessTokenType = AccessTokenType = {}));
  }
});

// ../types/dist/sign/interfaces.js
var require_interfaces5 = __commonJS({
  "../types/dist/sign/interfaces.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.signatureDefaultValues = exports.signCategories = void 0;
    exports.getFirstCoordinate = getFirstCoordinate;
    exports.getLastCoordinate = getLastCoordinate;
    exports.getColorForCategory = getColorForCategory;
    exports.defineDefaultValuesForSignature = defineDefaultValuesForSignature;
    function getFirstCoordinate(feature) {
      var _a, _b, _c, _d;
      switch ((_a = feature === null || feature === void 0 ? void 0 : feature.getGeometry()) === null || _a === void 0 ? void 0 : _a.getType()) {
        case "Polygon":
        case "MultiPolygon":
          return (_b = feature === null || feature === void 0 ? void 0 : feature.getGeometry()) === null || _b === void 0 ? void 0 : _b.getCoordinates()[0][0];
        case "LineString":
          return (_c = feature === null || feature === void 0 ? void 0 : feature.getGeometry()) === null || _c === void 0 ? void 0 : _c.getCoordinates()[0];
        case "Point":
          return (_d = feature === null || feature === void 0 ? void 0 : feature.getGeometry()) === null || _d === void 0 ? void 0 : _d.getCoordinates();
        default:
          return [];
      }
    }
    function getLastCoordinate(feature) {
      var _a, _b, _c, _d;
      switch ((_a = feature === null || feature === void 0 ? void 0 : feature.getGeometry()) === null || _a === void 0 ? void 0 : _a.getType()) {
        case "Polygon":
        case "MultiPolygon": {
          var pCoordinates = (_b = feature === null || feature === void 0 ? void 0 : feature.getGeometry()) === null || _b === void 0 ? void 0 : _b.getCoordinates();
          return pCoordinates[pCoordinates.length - 2][0];
        }
        case "LineString": {
          var lCoordinates = (_c = feature === null || feature === void 0 ? void 0 : feature.getGeometry()) === null || _c === void 0 ? void 0 : _c.getCoordinates();
          return lCoordinates[lCoordinates.length - 1];
        }
        case "Point":
          return (_d = feature === null || feature === void 0 ? void 0 : feature.getGeometry()) === null || _d === void 0 ? void 0 : _d.getCoordinates();
        default:
          return [];
      }
    }
    exports.signCategories = [{
      name: "place",
      color: "#0000FF"
    }, {
      name: "formation",
      color: "#0000FF"
    }, {
      name: "action",
      color: "#0000FF"
    }, {
      name: "damage",
      color: "#FF0000"
    }, {
      name: "danger",
      color: "#FF9100"
    }, {
      name: "effect",
      color: "#FFF333"
    }];
    function getColorForCategory(category) {
      var foundCategory = exports.signCategories.find(function(c) {
        return c.name === category;
      });
      return foundCategory ? foundCategory.color : "#535353";
    }
    exports.signatureDefaultValues = {
      style: "solid",
      size: void 0,
      color: function(kat) {
        if (kat) {
          return getColorForCategory(kat);
        } else {
          return "#535353";
        }
      },
      fillOpacity: 0.2,
      strokeWidth: 1,
      fontSize: 1,
      fillStyle: {
        name: "filled"
      },
      fillStyleAngle: 45,
      fillStyleSize: 5,
      fillStyleSpacing: 10,
      iconOffset: 0.1,
      protected: false,
      labelShow: true,
      arrow: "none",
      iconSize: 1,
      iconOpacity: 0.5,
      rotation: 1,
      images: [],
      flipIcon: false,
      hideIcon: false,
      affectedPersons: void 0
    };
    function defineDefaultValuesForSignature(signature) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
      signature.style = (_a = signature.style) !== null && _a !== void 0 ? _a : exports.signatureDefaultValues.style;
      signature.size = (_b = signature.size) !== null && _b !== void 0 ? _b : exports.signatureDefaultValues.size;
      signature.color = (_c = signature.color) !== null && _c !== void 0 ? _c : exports.signatureDefaultValues.color(signature.kat);
      signature.fillOpacity = (_d = signature.fillOpacity) !== null && _d !== void 0 ? _d : exports.signatureDefaultValues.fillOpacity;
      signature.strokeWidth = (_e = signature.strokeWidth) !== null && _e !== void 0 ? _e : exports.signatureDefaultValues.strokeWidth;
      signature.fontSize = (_f = signature.fontSize) !== null && _f !== void 0 ? _f : exports.signatureDefaultValues.fontSize;
      signature.fillStyle = (_g = signature.fillStyle) !== null && _g !== void 0 ? _g : exports.signatureDefaultValues.fillStyle;
      signature.fillStyle.angle = (_h = signature.fillStyle.angle) !== null && _h !== void 0 ? _h : exports.signatureDefaultValues.fillStyleAngle;
      signature.fillStyle.size = (_j = signature.fillStyle.size) !== null && _j !== void 0 ? _j : exports.signatureDefaultValues.fillStyleSize;
      signature.fillStyle.spacing = (_k = signature.fillStyle.spacing) !== null && _k !== void 0 ? _k : exports.signatureDefaultValues.fillStyleSpacing;
      signature.iconOffset = (_l = signature.iconOffset) !== null && _l !== void 0 ? _l : exports.signatureDefaultValues.iconOffset;
      signature.protected = (_m = signature.protected) !== null && _m !== void 0 ? _m : exports.signatureDefaultValues.protected;
      signature.labelShow = (_o = signature.labelShow) !== null && _o !== void 0 ? _o : exports.signatureDefaultValues.labelShow;
      signature.arrow = (_p = signature.arrow) !== null && _p !== void 0 ? _p : exports.signatureDefaultValues.arrow;
      signature.iconSize = (_q = signature.iconSize) !== null && _q !== void 0 ? _q : exports.signatureDefaultValues.iconSize;
      signature.iconOpacity = (_r = signature.iconOpacity) !== null && _r !== void 0 ? _r : exports.signatureDefaultValues.iconOpacity;
      signature.rotation = (_s = signature.rotation) !== null && _s !== void 0 ? _s : exports.signatureDefaultValues.rotation;
      signature.images = (_t = signature.images) !== null && _t !== void 0 ? _t : exports.signatureDefaultValues.images;
      signature.flipIcon = (_u = signature.flipIcon) !== null && _u !== void 0 ? _u : exports.signatureDefaultValues.flipIcon;
      signature.affectedPersons = (_v = signature.affectedPersons) !== null && _v !== void 0 ? _v : exports.signatureDefaultValues.affectedPersons;
    }
  }
});

// ../types/dist/state/interfaces.js
var require_interfaces6 = __commonJS({
  "../types/dist/state/interfaces.js"(exports) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ZsMapDrawElementStateType = exports.ZsMapLayerStateType = exports.PaperDimensions = exports.ZsMapDisplayMode = exports.getDefaultIZsMapState = exports.zsMapStateSourceToDownloadUrl = exports.ZsMapStateSource = void 0;
    var ZsMapStateSource;
    (function(ZsMapStateSource2) {
      ZsMapStateSource2["OPEN_STREET_MAP"] = "openStreetMap";
      ZsMapStateSource2["GEO_ADMIN_SWISS_IMAGE"] = "geoAdminSwissImage";
      ZsMapStateSource2["GEO_ADMIN_PIXEL"] = "geoAdminPixel";
      ZsMapStateSource2["GEO_ADMIN_PIXEL_BW"] = "geoAdminPixelBW";
      ZsMapStateSource2["LOCAL"] = "local";
      ZsMapStateSource2["NONE"] = "noBaseMap";
    })(ZsMapStateSource || (exports.ZsMapStateSource = ZsMapStateSource = {}));
    exports.zsMapStateSourceToDownloadUrl = (_a = {}, _a[ZsMapStateSource.LOCAL] = "https://zskarte.blob.core.windows.net/etienne/ch.swisstopo.pmtiles", _a);
    var getDefaultIZsMapState = function() {
      return {};
    };
    exports.getDefaultIZsMapState = getDefaultIZsMapState;
    var ZsMapDisplayMode;
    (function(ZsMapDisplayMode2) {
      ZsMapDisplayMode2["DRAW"] = "draw";
      ZsMapDisplayMode2["HISTORY"] = "history";
    })(ZsMapDisplayMode || (exports.ZsMapDisplayMode = ZsMapDisplayMode = {}));
    exports.PaperDimensions = {
      A0: [1189, 841],
      A1: [841, 594],
      A2: [594, 420],
      A3: [420, 297],
      A4: [297, 210],
      A5: [210, 148]
    };
    var ZsMapLayerStateType;
    (function(ZsMapLayerStateType2) {
      ZsMapLayerStateType2["DRAW"] = "draw";
      ZsMapLayerStateType2["GEO_DATA"] = "geoData";
    })(ZsMapLayerStateType || (exports.ZsMapLayerStateType = ZsMapLayerStateType = {}));
    var ZsMapDrawElementStateType;
    (function(ZsMapDrawElementStateType2) {
      ZsMapDrawElementStateType2["TEXT"] = "text";
      ZsMapDrawElementStateType2["SYMBOL"] = "symbol";
      ZsMapDrawElementStateType2["POLYGON"] = "polygon";
      ZsMapDrawElementStateType2["LINE"] = "line";
      ZsMapDrawElementStateType2["FREEHAND"] = "freehand";
    })(ZsMapDrawElementStateType || (exports.ZsMapDrawElementStateType = ZsMapDrawElementStateType = {}));
  }
});

// ../types/dist/index.js
var require_dist = __commonJS({
  "../types/dist/index.js"(exports) {
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
          enumerable: true,
          get: function() {
            return m[k];
          }
        };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    __exportStar(require_interfaces(), exports);
    __exportStar(require_interfaces2(), exports);
    __exportStar(require_interfaces3(), exports);
    __exportStar(require_interfaces4(), exports);
    __exportStar(require_interfaces5(), exports);
    __exportStar(require_interfaces6(), exports);
  }
});
export default require_dist();
//# sourceMappingURL=@zskarte_types.js.map
