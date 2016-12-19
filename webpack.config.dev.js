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
      'webpack-hot-middleware/client?reload=true&path=http://localhost:9000/__webpack_hmr',
      './app/project'
    ]
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/
    },
    {
      test: /\.css$/,
      loade: 'style!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader',
      exclude: /.*react-spinkit.*/
    },
    {
      test: /app\/src.*\.scss$/,
      loader: 'style!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader!sass?sourceMap',
      exclude: /.*project.*/
    },
    {
      test: /quill.*css$/,
      loader: 'style!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    },
    { test: /react-spinkit.*css$/,
      loader: 'style!css-loader?sourceMap&importLoaders=1'
    },
    {
      test: /project\.scss$/,
      loader: 'style!css?sourceMap&importLoaders=1!sass?sourceMap'
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
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new CopyWebpackPlugin([
      { from: { glob: 'node_modules/quill/dist/**.css' }, to: __dirname + '/dist/quill', flatten: true }
    ])
  ]
};

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
