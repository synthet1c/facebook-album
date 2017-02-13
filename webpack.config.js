const fs = require('fs')
const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({
  filename: "[name].[contenthash].css",
  disable: process.env.NODE_ENV === 'development'
})

module.exports = {
  context: __dirname,
  entry: {
    app: './source/js/app.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'app.bundle.js',
    publicPath: '/dist'
  },
  devtool: 'source-map',
  devServer: {
    port: 8008
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        //loader: extractSass.extract({
        //  loader: [
        //    { loader: 'css-loader' },
        //    { loader: 'sass-loader' }
        //  ],
        //  fallbackLoader: 'style-loader'
        //})
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015', 'stage-2'],
              cacheDirectory: '.webpackcache'
            }
          }
        ] 
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }

    ]
  }
};
