var webpack = require('webpack');
var path = require('path');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var config = {
  entry: {
    app: [
      'webpack-hot-middleware/client?reload=true&path=http://localhost:9000/__webpack_hmr',
      './app/index'
    ],
    open: [
      './shell/open'
    ],
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/
    },
    {
      test: /\.css$/,
      loader: 'style!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    },
    {
      test: /app\/src.*\.scss$/,
      loader: 'style!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader!sass'
    },
    {
      test: /quill.*css$/,
      loader: 'style!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    },
    {
      test: /shell\/.*\.scss$/,
      loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!sass?sourceMap'),
    },
    {
      test: /\.png|\.svg$/,
      loaders: ['file-loader']
    }]
  },
  output: {
    path: __dirname + '/dist',
    publicPath: 'http://localhost:9000/dist/',
    filename: '[name].bundle.js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, 'node_modules')]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('[name].css'),
    new CopyWebpackPlugin([
      { from: { glob: 'node_modules/quill/dist/**.css' }, to: __dirname + '/dist/quill', flatten: true }
    ])
  ]
};

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
