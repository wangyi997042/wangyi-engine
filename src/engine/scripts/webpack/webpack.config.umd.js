var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var config = require('./webpack.config.base');
var package = require('../../../../package.json');


var rootPath = path.resolve(__dirname, '../../');
var env = process.env.ENV;

config.entry = {
  ['wangyi-utils']: [
    rootPath + '/lib/index.js'
  ]
}

if(config.output) {
  config.output = {
    library: '__utils',
    libraryTarget: 'umd',
    path: path.join(__dirname, '../../dist'),
    filename: '[name].js',
    umdNamedDefine: true,
  }
}

if(config.plugins) {
  config.plugins.push(
    new webpack.NoEmitOnErrorsPlugin()
  )
}

if(env === 'production') {
  config.output.filename = '[name].min.js';
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    output: {
      comments: false,
    },
    sourceMap: true,
    mangle: true,
  }));
}

module.exports = config;
