"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessTokenType = exports.PermissionType = void 0;
var PermissionType;
(function (PermissionType) {
    PermissionType["READ"] = "read";
    PermissionType["WRITE"] = "write";
    PermissionType["ALL"] = "all";
})(PermissionType || (exports.PermissionType = PermissionType = {}));
var AccessTokenType;
(function (AccessTokenType) {
    AccessTokenType["LONG"] = "long";
    AccessTokenType["SHORT"] = "short";
})(AccessTokenType || (exports.AccessTokenType = AccessTokenType = {}));
