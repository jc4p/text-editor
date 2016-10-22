var config = require('./webpack.config.dev.js');
config.entry['app'].shift();
config.entry['open'].shift();
config.plugins.shift();
config.plugins.shift();
config.output.publicPath = './dist/';
module.exports = config;
