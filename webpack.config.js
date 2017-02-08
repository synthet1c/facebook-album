const fs = require('fs')

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
          presets: ['es2015'],
          cacheDirectory: '.webpackcache'
        }
      },
    ]
  }
};
