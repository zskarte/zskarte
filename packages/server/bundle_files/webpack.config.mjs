import path from 'node:path';
import fs from 'node:fs';
import webpack from 'webpack';
//import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const referencePath = process.cwd();
const workspaceReferencePath = path.dirname(path.dirname(referencePath));

const distSrcDir = 'dist/src';
//make sure dirs exist
//require.context from webpack will throw an error if folder does not exist
for (const dirName of ['middlewares', 'api', 'components', 'extensions', '../../config/sync']) {
  const dir = path.resolve(referencePath, distSrcDir, dirName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
const dir = path.resolve(referencePath, 'database/migrations');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

//check for modules bufferutil / utf-8-validate and if exist prevent to copy not needed node files to output by delete them from prebuilds
const additionalIgnored = [];
const additionalPlugins = [];
const removeUnmatchingPrebuilds = (moduleName, addPluginOnError) => {
  try {
    const bufferutilRoot = path.dirname(require.resolve(`${moduleName}/package.json`));
    const prebuildsDir = path.join(bufferutilRoot, 'prebuilds');
    const bufferutilPrebuildDirs = fs
      .readdirSync(prebuildsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith(process.platform))
      .map((d) => path.join(prebuildsDir, d.name));
    bufferutilPrebuildDirs.forEach((dir) => {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`removed: ${dir}`);
    });
  } catch (e) {
    if (addPluginOnError) {
      console.log(`${moduleName} for clean prebuilds not found, prevent using module`);
      additionalPlugins.push(addPluginOnError);
    } else {
      console.log(`${moduleName} for clean prebuilds not found, add the module to "externals"`);
      additionalIgnored.push(moduleName);
    }
  }
};
removeUnmatchingPrebuilds(
  'bufferutil',
  new webpack.DefinePlugin({
    'process.env.WS_NO_BUFFER_UTIL': JSON.stringify('1'), // set this value fixed for webpack, so the module loading in ws/lib/buffer-util.js is not triggered
  }),
);
removeUnmatchingPrebuilds(
  'utf-8-validate',
  new webpack.DefinePlugin({
    'process.env.WS_NO_UTF_8_VALIDATE': JSON.stringify('1'), // set this value fixed for webpack, so the module loading in ws/lib/validation.js is not triggered
  }),
);
//this modules are marked as external so they are NOT bundled, doing this as they are imported but not used by codeflow and only increase bundle size.
const ignoredModules = [
  //prevent loading/packing unused DB dialects (bases on .env: DATABASE_CLIENT / @strapi/database/dist/connection.js / knex/lib/dialects/index.js)
  'mysql',
  'mssql',
  'tedious',
  'mysql2',
  'oracledb',
  //'better-sqlite3',
  'sqlite3',
  'mongoose',
  'monogodb',
  'pg',
  'pg-hstore',
  'pg-query-stream',
  'pg-native',
  //prevent loading/packing unused rateLimit stores (default is MemoryStore, see https://docs.strapi.io/cms/configurations/admin-panel#rate-limiting)
  'redis',
  'sequelize',
  'mongoose',
  //requested by 'grant' for other handlers, strapi only use koa
  '@hapi/hapi/package.json',
  'hapi/package.json',
  //requested by different logging mechanism if process.env.DEBUG
  'request-logs',
  //no new type generation in sea context required
  '@strapi/generators', //'plop', 'node-plop',
];
const configs = {
  entry: './dist/src/server.js',
  mode: 'production', //process.env.NODE_ENV, //'development', or 'production'
  target: 'node',
  optimization: {
    minimize: false,
    splitChunks: false,
    runtimeChunk: false,
    concatenateModules: true,
  },
  resolve: {
    alias: {
      'lodash/fp': 'lodash/fp.js',
      'knex/lib/query/querybuilder': 'knex/lib/query/querybuilder.js',
      'knex/lib/raw': 'knex/lib/raw.js',
      'stream-json/jsonl/Parser': 'stream-json/jsonl/Parser.js',
      'stream-json/jsonl/Stringer': 'stream-json/jsonl/Stringer.js',
      //prevent loading 'keyv' (and parent dependencies: 'package-json', 'cacheable-request') as it use dynamic imports but is unused (strapi update-notifier is deactivated)
      'package-json': path.resolve(referencePath, 'bundle_files/generic.mock.js'),
    },
  },
  plugins: [
    ...[
      //to show size and files that are part of the bundle activate the following line
      //new BundleAnalyzerPlugin(),
      new webpack.IgnorePlugin({
        resourceRegExp: RegExp('^(' + ignoredModules.join('|') + additionalIgnored.join('|') + ')$'),
      }),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ContextReplacementPlugin(/^appDir$/, referencePath),
      new webpack.ContextReplacementPlugin(/^config$/, path.resolve(referencePath, 'dist/config')),
      new webpack.ContextReplacementPlugin(/^middlewares$/, path.resolve(referencePath, distSrcDir, 'middlewares')),
      new webpack.ContextReplacementPlugin(/^api$/, path.resolve(referencePath, distSrcDir, 'api')),
      new webpack.ContextReplacementPlugin(/^components$/, path.resolve(referencePath, distSrcDir, 'components')),
      new webpack.ContextReplacementPlugin(/^extensions$/, path.resolve(referencePath, distSrcDir, 'extensions')),
      new webpack.ContextReplacementPlugin(/^migrations$/, path.resolve(referencePath, 'database/migrations')),
      new webpack.ContextReplacementPlugin(/^@strapi$/, path.resolve(workspaceReferencePath, 'node_modules/@strapi')),
      new webpack.ContextReplacementPlugin(/^node_modules$/, path.resolve(workspaceReferencePath, 'node_modules')),
      new webpack.ContextReplacementPlugin(/^node_modules_strapi_plugin_package$/, (context) => {
        Object.assign(context, {
          //filter loaded files, suppose all plugins have strapi in it's name
          regExp: /^\.\/(?!.*node_modules).*strapi.+\/package.json$/,
          request: path.resolve(workspaceReferencePath, 'node_modules'),
        });
      }),
      //new webpack.ContextReplacementPlugin(/^node_modules_strapi_plugin_server_js$/, path.resolve(workspaceReferencePath, 'node_modules')),
      new webpack.ContextReplacementPlugin(/^node_modules_strapi_plugin_server_js$/, (context) => {
        Object.assign(context, {
          //filter loaded files, suppose all plugins have strapi in it's name
          regExp: /^\.\/(?!.*node_modules).*strapi.+\/server\/[^/]+\.js$/,
          request: path.resolve(workspaceReferencePath, 'node_modules'),
        });
      }),
      new webpack.ContextReplacementPlugin(/^customMiddlewares$/, (context) => {
        Object.assign(context, {
          //define path and filter that include the custom middlewares
          regExp: /^\.\/(?!.*node_modules).*middleware.+\/server\/[^/]+\.js$/,
          request: path.resolve(workspaceReferencePath, 'node_modules'),
        });
      }),
      new webpack.ContextReplacementPlugin(
        /^sqlite3_node_dir$/,
        path.resolve(workspaceReferencePath, 'node_modules/better-sqlite3/build/Release'),
      ),
      new webpack.ContextReplacementPlugin(/^config\/sync$/, path.resolve(referencePath, 'config/sync')),
      //new webpack.ContextReplacementPlugin(/^admin_web$/, path.resolve(referencePath, 'dist/build')),
      new webpack.ContextReplacementPlugin(/^admin_web$/, (context) => {
        Object.assign(context, {
          //include all admin files but exclude unused ~11mb EE feature Purchase*
          //regExp: /\/(?![pP]urchase).*\.(html|css|js)$/,
          //also exclude unused language files (adjust list and remove the used ones, based on src/admin/app.tsx locales)
          //regExp: /\/(?![pP]urchase|(ar|ca|cs|de|dk|es|en|eu|fr|gu|he|hi|hu|id|it|ja|ko|ml|ms|nl|no|pl|pt|ru|sa|sk|sv|th|tr|uk|vi|zh)[.-]).*\.(html|css|js)$/,
          regExp:
            /\/(?![pP]urchase|(ar|ca|cs|dk|es|eu|gu|he|hi|hu|id|ja|ko|ml|ms|nl|no|pl|pt|ru|sa|sk|sv|th|tr|uk|vi|zh)[.-]).*\.(html|css|js)$/,
          request: path.resolve(referencePath, 'dist/build'),
        });
      }),
      new webpack.ContextReplacementPlugin(/^favicon$/, referencePath),
      new webpack.ContextReplacementPlugin(/^sharp_node_fallback_dir$/, referencePath),
      new webpack.ContextReplacementPlugin(
        /^node_modules_@img_versions$/,
        path.resolve(workspaceReferencePath, 'node_modules/@img'),
      ),
    ],
    ...additionalPlugins,
  ],
  module: {
    rules: [
      {
        test: /\.(html|css|js)$/,
        include: path.resolve(referencePath, 'dist/build'),
        type: 'asset/source',
      },
      {
        test: /favicon\.(ico|png)$/,
        type: 'asset/inline',
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
        options: {
          //name: '[name].[contenthash].[ext]',
          name(resourcePath) {
            const pathParts = resourcePath.split(/[\/\\]/);
            const fileName = pathParts[pathParts.length - 1];
            const dirName = pathParts[pathParts.length - 3] === 'prebuilds' ? pathParts[pathParts.length - 2] : null;

            let namePattern = '[name]';
            if (dirName && !fileName.includes('win32') && !fileName.includes('linux') && !fileName.includes('darwin')) {
              namePattern = namePattern + '-' + dirName;
            }
            const nmIndex = pathParts.lastIndexOf('node_modules');
            if (nmIndex !== -1 && pathParts[nmIndex + 1]) {
              let moduleName = pathParts[nmIndex + 1];
              const moduleNameRegex = new RegExp(moduleName.replace(/[^a-zA-Z]/g, '.?'));
              if (moduleName && !moduleNameRegex.test(fileName)) {
                namePattern = moduleName + '-' + namePattern;
              }
            }
            return namePattern + '.[ext]';
          },
        },
      },
      {
        //filter out invalid files that would be loaded by Webpack based on require(`path/${var}`)
        test: /(\.txt|\.md|\.map|\.d\.ts|LICENSE)$/,
        use: 'null-loader',
      },
      {
        test: /\.json$/,
        type: 'json',
      },
      {
        test: /\.pub$/,
        type: 'asset/source',
      },
      {
        test: /\.ts$/,
        type: 'null-loader',
      },
    ],
  },
};

import { readFileSync } from 'fs';
import { join } from 'path';

const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const moduleType = packageJson.type; // "module" or "commonjs" or undefined

let activeConfig;
if (moduleType === 'module') {
  //ESModule
  activeConfig = {
    ...configs,
    experiments: {
      outputModule: true,
      topLevelAwait: true,
    },
    output: {
      module: true,
      environment: { module: true },
      filename: 'index.mjs',
      path: path.resolve(referencePath, 'bundled'),
      publicPath: '',
      library: { type: 'module' },
    },
  };
  //try first to load ESModules before CommonJS
  activeConfig.resolve.mainFields = ['module', 'main'];
  //prevent loading 'typescript'
  activeConfig.resolve.alias['@strapi/typescript-utils'] = path.resolve(referencePath, 'bundle_files/tsutil.mock.mjs');
  activeConfig.module.parser = {
    javascript: {
      importMeta: true, // evaluate import.meta
      importMetaContext: true, // allow import.meta.webpackContext
    },
  };
} else {
  //CommonJS
  activeConfig = {
    ...configs,
    output: {
      filename: 'index.js',
      path: path.resolve(referencePath, 'bundled'),
      libraryTarget: 'commonjs2',
    },
  };
  //on normal strapi run CommonJS is prefered so do this here also
  activeConfig.resolve.mainFields = ['main', 'module'];
  //prevent loading 'typescript'
  activeConfig.resolve.alias['@strapi/typescript-utils'] = path.resolve(referencePath, 'bundle_files/tsutil.mock.cjs');
  //file-type is ESM only, "fix" by direct use js file (and not checking exports from package.json)
  activeConfig.resolve.alias['file-type'] = path.resolve(workspaceReferencePath, 'node_modules/file-type/index.js');
}

export default activeConfig;
