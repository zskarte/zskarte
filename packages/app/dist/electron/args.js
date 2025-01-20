"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgsHandler = void 0;
var args = process.argv.slice(1);
var ArgsHandler = /** @class */ (function () {
    function ArgsHandler() {
    }
    ArgsHandler.serve = args.some(function (val) { return val === '--serve'; });
    return ArgsHandler;
}());
exports.ArgsHandler = ArgsHandler;
//# sourceMappingURL=args.js.map