// webpack.config.js
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const referencePath = process.cwd();

const distSrcDir = 'dist/src';
//make sure dirs exist
//require.context from webpack will throw an error if folder does not exist
for (const dirName of ['middlewares', 'api', 'components', 'extensions']) {
  const dir = path.resolve(referencePath, distSrcDir, dirName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

module.exports = {
  entry: './dist/src/server.js',
  output: {
    filename: 'index.js',
    path: path.resolve(referencePath, 'bundled'),
    libraryTarget: 'commonjs2',
  },
  mode: 'production', //process.env.NODE_ENV, //'development', or 'production'
  target: 'node',
  externals: [
    'tedious',
    'mysql',
    'mysql2',
    'oracledb',
    'sqlite3',
    'mongoose',
    'monogodb',
    'plop',
    'node-plop',
    'prettier',
  ],
  resolve: {
    alias: {
      'lodash/fp': 'lodash/fp.js',
      'knex/lib/query/querybuilder': 'knex/lib/query/querybuilder.js',
      'knex/lib/raw': 'knex/lib/raw.js',
      'stream-json/jsonl/Parser': 'stream-json/jsonl/Parser.js',
      'stream-json/jsonl/Stringer': 'stream-json/jsonl/Stringer.js',
    },
  },
  plugins: [
    //to show size and files that are part of the bundle activate the following line
    //new BundleAnalyzerPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ContextReplacementPlugin(/^appDir$/, referencePath),
    new webpack.ContextReplacementPlugin(/^config$/, path.resolve(referencePath, 'dist/config')),
    new webpack.ContextReplacementPlugin(/^middlewares$/, path.resolve(referencePath, distSrcDir, 'middlewares')),
    new webpack.ContextReplacementPlugin(/^api$/, path.resolve(referencePath, distSrcDir, 'api')),
    new webpack.ContextReplacementPlugin(/^components$/, path.resolve(referencePath, distSrcDir, 'components')),
    new webpack.ContextReplacementPlugin(/^extensions$/, path.resolve(referencePath, distSrcDir, 'extensions')),
    new webpack.ContextReplacementPlugin(/^@strapi$/, path.resolve(referencePath, '../../node_modules/@strapi')),
    new webpack.ContextReplacementPlugin(/^node_modules$/, path.resolve(referencePath, '../../node_modules')),
    new webpack.ContextReplacementPlugin(/^node_modules_strapi_plugin_package$/, (context) => {
      Object.assign(context, {
        //filter loaded files, suppose all plugins have strapi in it's name
        regExp: /^\.\/(?!.*node_modules).*strapi.+\/package.json$/,
        request: path.resolve(referencePath, '../../node_modules'),
      });
    }),
    //new webpack.ContextReplacementPlugin(/^node_modules_strapi_plugin_server_js$/, path.resolve(referencePath, '../../node_modules')),
    new webpack.ContextReplacementPlugin(/^node_modules_strapi_plugin_server_js$/, (context) => {
      Object.assign(context, {
        //filter loaded files, suppose all plugins have strapi in it's name
        regExp: /^\.\/(?!.*node_modules).*strapi.+\/server\/[^/]+\.js$/,
        request: path.resolve(referencePath, '../../node_modules'),
      });
    }),
    new webpack.ContextReplacementPlugin(/^customMiddlewares$/, (context) => {
      Object.assign(context, {
        //define path and filter that include the custom middlewares
        regExp: /^\.\/(?!.*node_modules).*middleware.+\/server\/[^/]+\.js$/,
        request: path.resolve(referencePath, '../../node_modules'),
      });
    }),
    new webpack.ContextReplacementPlugin(
      /^sqlite3_node_dir$/,
      path.resolve(referencePath, '../../node_modules/better-sqlite3/build/Release'),
    ),
    new webpack.ContextReplacementPlugin(/^config\/sync$/, path.resolve(referencePath, 'config/sync')),
    new webpack.ContextReplacementPlugin(/^admin_web$/, path.resolve(referencePath, 'dist/build')),
    new webpack.ContextReplacementPlugin(/^favicon.ico$/, referencePath),
  ],
  optimization: {
    minimize: false,
    splitChunks: false,
    runtimeChunk: false,
  },
  module: {
    rules: [
      {
        test: /\.(html|css|js)$/,
        include: path.resolve(referencePath, 'dist/build'),
        type: 'asset/source',
      },
      {
        test: /favicon\.ico$/,
        type: 'asset/inline',
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
        options: {
          name: '[name].[ext]',
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
