'use strict';

var tsutil = {
    isUsingTypeScript: async (filePath) => false,
    isUsingTypeScriptSync: (filePath) => false,
    resolveOutDir: async (filePath) => undefined,
    resolveOutDirSync:(filePath) => undefined,
    compile: async (filePath, config) => undefined,
    generators: {
        generate: async (config) => undefined,
    },
};

module.exports = tsutil;
