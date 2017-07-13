var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var IS_PRODUCTION = process.env['NODE_ENV'] == 'production';
var NODE_MODULES = path.resolve('./node_modules');

const TARGET_PATH = 'js/bundles';

module.exports = {
  // context: '', // some root path
  resolve: {
    modules: [
      'node_modules',
      'src'
    ]
  },
  entry: './src/app.js',
  devtool: IS_PRODUCTION ? 'source-map' : '#inline-source-map',
  output: {
    path: path.resolve('./assets/'), // get absolute path from fs
    filename: TARGET_PATH + '/[name]' + (IS_PRODUCTION ? '.[hash:6]' : '') + '.bundle.js',
    chunkFilename: TARGET_PATH + '/[id].bundle.js',
    publicPath: '/', // This is used to generate URLs to e.g. images, could be relative or http too
    sourceMapFilename: TARGET_PATH + '/[name]' + (IS_PRODUCTION ? '.[hash:6]' : '') + '.bundle.map'
  },
  devServer: { // ????
    inline: true,
    port: 3000
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            'react',
            [ 'es2015', { modules: false } ],
            'stage-0',
            'env'
          ]
        }
      },
      { test: /\.hbs$/, loader: 'handlebars-loader' },
      {
        test: /\.css/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.(svg|jpg|png|gif)$/,
        loader: 'url-loader?limit=4000&name=images/[name].[ext]'
      },
      {
        // this would output any imported font to assets/fonts/...  (?)
        // same could be done with images
        // removed svg in favor of url loader above
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery'
    }),
    // new ExtractTextPlugin('css/[name]-[local]-[hash:6].css'),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(IS_PRODUCTION ? 'production' : 'development')
      }
    }),
    (function(){
      if (IS_PRODUCTION) {
        console.log('uglifying')
        return new webpack.optimize.UglifyJsPlugin({
          compress: { warnings: false },
          output: { comments: false }
        })
      } else {
        return function () {
          console.log('uglify desactivated')
        }
      }
    })(),
    new webpack.optimize.CommonsChunkPlugin({
      filename: TARGET_PATH + '/common' + (IS_PRODUCTION ? '.[hash:6]' : '') + '.bundle.js',
      name: 'common'
    })
    // will generate common.js for shared code
  ]
}
