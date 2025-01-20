/* eslint-disable @typescript-eslint/no-explicit-any */
// This file is loaded whenever a javascript context is created. It runs in a
// private scope that can access a subset of electron renderer APIs. We must be
// careful to not leak any objects into the global scope!
// eslint-disable-next-line @typescript-eslint/no-require-imports
var _a = require('electron'), ipcRenderer = _a.ipcRenderer, contextBridge = _a.contextBridge;
var allowedChannels = ['fs:saveFile', 'fs:openFile'];
var checkChannel = function (channel) {
    if (!allowedChannels.includes(channel)) {
        throw new Error("Calling IPC channel ".concat(channel, " is not allowed"));
    }
};
contextBridge.exposeInMainWorld('zskarte', {
    ipcInvoke: function (channel, params) {
        checkChannel(channel);
        return ipcRenderer.invoke(channel, params);
    },
    ipcOn: function (channel, callback) {
        checkChannel(channel);
        ipcRenderer.on(channel, callback);
    },
});
//# sourceMappingURL=preload.js.map