"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcHandler = void 0;
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var IpcHandler = /** @class */ (function () {
    function IpcHandler() {
    }
    IpcHandler.initialize = function () {
        var _this = this;
        electron_1.ipcMain.handle('fs:saveFile', function (_event, params) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, electron_1.dialog.showSaveDialog({
                            defaultPath: path_1.default.join(electron_1.app.getPath('desktop'), params.fileName),
                            filters: params.filters,
                        })];
                    case 1:
                        result = _b.sent();
                        if (!(result && !result.canceled && result.filePath)) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs_1.default.promises.writeFile((_a = result === null || result === void 0 ? void 0 : result.filePath) === null || _a === void 0 ? void 0 : _a.toString(), params.data, { encoding: 'utf8' })];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        electron_1.ipcMain.handle('fs:openFile', function (_event, params) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, electron_1.dialog.showOpenDialog({
                            defaultPath: path_1.default.join(electron_1.app.getPath('desktop')),
                            filters: params.filters,
                            properties: ['openFile'],
                        })];
                    case 1:
                        result = _c.sent();
                        if (!(result && !result.canceled && ((_a = result.filePaths) === null || _a === void 0 ? void 0 : _a.length) > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs_1.default.promises.readFile((_b = result === null || result === void 0 ? void 0 : result.filePaths) === null || _b === void 0 ? void 0 : _b[0].toString(), 'utf8')];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3: return [2 /*return*/, undefined];
                }
            });
        }); });
    };
    return IpcHandler;
}());
exports.IpcHandler = IpcHandler;
//# sourceMappingURL=ipc.js.map