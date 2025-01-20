"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
// import pkgJson from '../../package.json';
var ipc_1 = require("./ipc");
var windows_1 = require("./windows");
// AutoUpdateHandler.initialize();
electron_1.app.whenReady().then(function () {
    // // this is might be required for some external libs ind the future
    // if (!protocol.isProtocolRegistered('file')) {
    //   protocol.registerFileProtocol('file', (request, callback) => {
    //     const pathname = request.url.replace('file:///', '');
    //     callback(pathname);
    //   });
    // }
    ipc_1.IpcHandler.initialize();
    windows_1.AppWindowHandler.createAppWindow();
});
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    var currentWindow = windows_1.AppWindowHandler.getMainWindow();
    if (!currentWindow) {
        windows_1.AppWindowHandler.createAppWindow();
    }
    else {
        currentWindow.focus();
    }
});
//# sourceMappingURL=index.js.map