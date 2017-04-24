var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var IS_PRODUCTION = process.env['NODE_ENV'] == 'production';
var NODE_MODULES = path.resolve('./node_modules');

const TARGET_PATH = 'js/bundles';

module.exports = {
  // context: '', // some root path
  resolve: {
    modulesDirectories: [
      'node_modules',
      'src'
    ]
  },
  entry: './src/app.js',
  devtool: IS_PRODUCTION ? 'source-map' : '#inline-source-map',
  output: {
    path: path.resolve('./assets/'), // get absolute path from fs
    filename: TARGET_PATH + '/[name]' + (IS_PRODUCTION?'.[hash:6]':'') + '.bundle.js',
    chunkFilename: TARGET_PATH + '/[id].bundle.js',
    publicPath: '/', // This is used to generate URLs to e.g. images, could be relative or http too
    sourceMapFilename: TARGET_PATH + '/[name]' + (IS_PRODUCTION?'.[hash:6]':'') + '.bundle.map'
  },
  devServer: { // ????
    inline: true,
    port: 3000
  },
  module: {
    loaders: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-0']
        }
      },
      { test: /\.hbs$/, loader: 'handlebars-loader' },
      {
        test: /\.css/,
        loaders: ['style', 'css']
      },
      {
        test: /\.(svg|jpg|png|gif)$/,
        loader: 'url?limit=4000&name=images/[name].[ext]'
      },
      {
        // this would output any imported font to assets/fonts/...  (?)
        // same could be done with images
        // removed svg in favor of url loader above
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file?name=fonts/[name].[ext]'
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
      'process.env':{
        'NODE_ENV': JSON.stringify(IS_PRODUCTION ? 'production' : 'development')
      }
    }),
    //new webpack.optimize.UglifyJsPlugin({
    //  compress:{
    //    warnings: false
    //  },
    //  output:{
    //    comments: false
    //  }
    //}),
    new webpack.optimize.CommonsChunkPlugin({
      filename: TARGET_PATH + '/common' + (IS_PRODUCTION?'.[hash:6]':'') + '.bundle.js',
      name: 'common'
    })
    // will generate common.js for shared code
  ]
};
