"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppWindowHandler = void 0;
var args_1 = require("./args");
var electron_1 = require("electron");
var path = __importStar(require("path"));
var AppWindowHandler = /** @class */ (function () {
    function AppWindowHandler() {
    }
    AppWindowHandler.loadUrl = function (window) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!args_1.ArgsHandler.serve) return [3 /*break*/, 2];
                        return [4 /*yield*/, window.loadURL('http://localhost:4300')];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, window.loadURL("file://".concat(path.resolve(__dirname, '../../../zskarte-v3/browser/index.html')))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AppWindowHandler.createAppWindow = function () {
        return __awaiter(this, void 0, void 0, function () {
            var window;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        window = new electron_1.BrowserWindow({
                            height: 800,
                            minHeight: 700,
                            width: 1200,
                            minWidth: 700,
                            show: false,
                            frame: true,
                            fullscreenable: true,
                            webPreferences: {
                                sandbox: true,
                                contextIsolation: true,
                                allowRunningInsecureContent: false,
                                nodeIntegration: false,
                                webSecurity: true,
                                preload: path.join(__dirname, 'preload.js'),
                            },
                        });
                        window.webContents.on('dom-ready', function () {
                            if (!window.isVisible()) {
                                window.show();
                            }
                        });
                        window.webContents.on('did-fail-load', function (event) {
                            console.error('did-fail-load', event);
                            // dialog.showErrorBox('did-fail-load', JSON.stringify(event, null, 3));
                        });
                        window.on('close', function () {
                            var index = AppWindowHandler._windows.indexOf(window);
                            if (index > -1) {
                                AppWindowHandler._windows.splice(index, 1);
                            }
                        });
                        return [4 /*yield*/, AppWindowHandler.loadUrl(window)];
                    case 1:
                        _a.sent();
                        AppWindowHandler._windows.push(window);
                        return [2 /*return*/];
                }
            });
        });
    };
    AppWindowHandler.close = function (window) {
        if (window) {
            window.close();
            // _.remove(AppWindowHandler._windows, window);
        }
    };
    AppWindowHandler.getMainWindow = function () {
        return AppWindowHandler._windows[0];
    };
    // public static win: BrowserWindow;
    AppWindowHandler._windows = [];
    return AppWindowHandler;
}());
exports.AppWindowHandler = AppWindowHandler;
//# sourceMappingURL=windows.js.map