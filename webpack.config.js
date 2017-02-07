const fs = require('fs')

module.exports = {
  context: __dirname,
  entry: './source/js/app.js',
  output: {
    host: 'example.com',
    path: './dist',
    filename: 'app.bundle.js',
    publicPath: '/dist/',
    https: {
      key: fs.readFileSync('/opt/certs/example.com.key'),
      cert: fs.readFileSync('/opt/certs/example.com.crt')
    }
  },
  devtool: 'source-map',
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
