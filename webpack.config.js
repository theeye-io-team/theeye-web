'use strict'

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const NODE_ENV = process.env['NODE_ENV'] || 'local'
const IS_PRODUCTION = (NODE_ENV === 'production' || NODE_ENV === 'staging')
const PUBLIC_PATH = typeof process.env['PUBLIC_PATH'] === 'string' ? process.env['PUBLIC_PATH'] : '/'

const FILENAME = IS_PRODUCTION ? '[name].[hash:6]' : '[name]'
const TARGET_PATH = 'bundles'

module.exports = {
  entry: path.join(__dirname, 'src/app.js'),
  devtool: IS_PRODUCTION ? 'source-map' : '#inline-source-map',
  output: {
    path: path.join(__dirname, '/assets/'),
    filename: TARGET_PATH + '/js/' + FILENAME + '.bundle.js',
    sourceMapFilename: TARGET_PATH + '/js/' + FILENAME + '.bundle.map',
    chunkFilename: TARGET_PATH + '/js/' + FILENAME + '.bundle.js',
    publicPath: PUBLIC_PATH
  },
  resolve: {
    modules: [
      'node_modules',
      'src'
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      'process.env': { 'NODE_ENV': JSON.stringify(NODE_ENV) }
    }),
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      filename: TARGET_PATH + '/js/' + FILENAME + '.bundle.js',
      name: 'common',
      minChunks: 2
    }),
    // new ExtractTextPlugin('css/[name]-[local]-[hash:6].css'),
    new ExtractTextPlugin(TARGET_PATH + '/styles/' + FILENAME + '.css'),
    new HtmlWebpackPlugin({
      template: 'src/templates/index.html',
      inject: 'body',
      filename: 'index.html'
    }),
    (function () {
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
    })()
  ],
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
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader'
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
          use: [{
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              minimize: IS_PRODUCTION,
            //  root: '/'
            }
          }, {
            loader: 'less-loader' // compiles Less to CSS
          }],
          fallback: 'style-loader',
        })
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: [{
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              minimize: IS_PRODUCTION,
            //  root: '/'
            }
          }],
          fallback: 'style-loader',
        })
        //loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: TARGET_PATH + '/images/'
            }
          }
        ]
      },
      //{
      //  test: /\.(svg|jpg|png|gif)$/,
      //  loader: 'url-loader?limit=4000&name=images/[name].[ext]'
      //},
      //{
      //  test: /\.(eot|ttf|woff|woff2)$/,
      //  loader: 'file-loader?name=fonts/[name].[ext]'
      //}
    ]
  }
}
