var config = require('./webpack.config.dev.js');
config.entry.shift();
config.plugins.shift();
config.output.publicPath = './dist/';
module.exports = config;
