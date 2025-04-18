var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var config = require('./webpack.config.base');

var rootPath = path.resolve(__dirname, '../../');

config.mode = 'development';

config.entry = {
  index: [
    rootPath + '/examples/index.js'
  ]
}

if(config.plugins) {
  config.plugins.push(
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: rootPath + '/examples/index.html',
      chunks: ['index']
    })
  );
}

config.devServer = {
  publicPath: '/',
  historyApiFallback: true,
  quiet: true,
};

module.exports = config;
