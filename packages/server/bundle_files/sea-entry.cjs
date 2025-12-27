const { getAsset } = require('node:sea');
/*
const { createContext, SourceTextModule } = require('node:vm');
const code = getAsset('index.mjs', 'utf8');
const context = createContext({});
const strapiAppModule = new SourceTextModule(code, { context });
(async () => {
    await strapiAppModule.link(() => {});
    await strapiAppModule.evaluate();
})();
*/
const fs = require('fs');
const code = getAsset('index.mjs', 'utf8');
fs.writeFileSync('zskarte-temp.mjs', code);
(async () => {
    try {
    await import('./zskarte-temp.mjs');
    } finally {
        fs.unlinkSync('zskarte-temp.mjs');
    }
})();