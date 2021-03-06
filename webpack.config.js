const fs = require('fs')

const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: './source/js/app.js',
  output: {
    host: 'example.com',
    path: './dist',
    filename: 'app.bundle.js',
    publicPath: '/dist/'
  },
  devtool: 'source-map',
  devserver: {
    port: 8008
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-2'],
          cacheDirectory: '.webpackcache'
        }
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          'style', // The backup style loader
          'css?sourceMap!sass?sourceMap'
        )
      }
    ]
  },
  sassLoader: {
    includePaths: [ 'source/scss' ]
  },
  plugins: [
    new ExtractTextPlugin('main.css')
  ]
};
