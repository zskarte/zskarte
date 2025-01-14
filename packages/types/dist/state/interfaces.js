"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZsMapDrawElementStateType = exports.ZsMapLayerStateType = exports.PaperDimensions = exports.ZsMapDisplayMode = exports.getDefaultIZsMapState = exports.zsMapStateSourceToDownloadUrl = exports.ZsMapStateSource = void 0;
var ZsMapStateSource;
(function (ZsMapStateSource) {
    ZsMapStateSource["OPEN_STREET_MAP"] = "openStreetMap";
    ZsMapStateSource["GEO_ADMIN_SWISS_IMAGE"] = "geoAdminSwissImage";
    ZsMapStateSource["GEO_ADMIN_PIXEL"] = "geoAdminPixel";
    ZsMapStateSource["GEO_ADMIN_PIXEL_BW"] = "geoAdminPixelBW";
    ZsMapStateSource["LOCAL"] = "local";
    ZsMapStateSource["NONE"] = "noBaseMap";
})(ZsMapStateSource || (exports.ZsMapStateSource = ZsMapStateSource = {}));
exports.zsMapStateSourceToDownloadUrl = (_a = {},
    _a[ZsMapStateSource.LOCAL] = 'https://zskarte.blob.core.windows.net/etienne/ch.swisstopo.pmtiles',
    _a);
var getDefaultIZsMapState = function () {
    return {};
};
exports.getDefaultIZsMapState = getDefaultIZsMapState;
var ZsMapDisplayMode;
(function (ZsMapDisplayMode) {
    ZsMapDisplayMode["DRAW"] = "draw";
    ZsMapDisplayMode["HISTORY"] = "history";
})(ZsMapDisplayMode || (exports.ZsMapDisplayMode = ZsMapDisplayMode = {}));
//DIN paper dimension in mm, landscape
exports.PaperDimensions = {
    A0: [1189, 841],
    A1: [841, 594],
    A2: [594, 420],
    A3: [420, 297],
    A4: [297, 210],
    A5: [210, 148],
};
var ZsMapLayerStateType;
(function (ZsMapLayerStateType) {
    ZsMapLayerStateType["DRAW"] = "draw";
    ZsMapLayerStateType["GEO_DATA"] = "geoData";
})(ZsMapLayerStateType || (exports.ZsMapLayerStateType = ZsMapLayerStateType = {}));
var ZsMapDrawElementStateType;
(function (ZsMapDrawElementStateType) {
    ZsMapDrawElementStateType["TEXT"] = "text";
    ZsMapDrawElementStateType["SYMBOL"] = "symbol";
    ZsMapDrawElementStateType["POLYGON"] = "polygon";
    ZsMapDrawElementStateType["LINE"] = "line";
    ZsMapDrawElementStateType["FREEHAND"] = "freehand";
})(ZsMapDrawElementStateType || (exports.ZsMapDrawElementStateType = ZsMapDrawElementStateType = {}));
