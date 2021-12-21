const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
//const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const NODE_ENV = process.env['NODE_ENV'] || 'default'
const PUBLIC_PATH = typeof process.env['PUBLIC_PATH'] === 'string' ? process.env['PUBLIC_PATH'] : '/'
const TARGET_PATH = 'bundles/'

module.exports = {
  //stats: 'verbose',
  entry: `${__dirname}/src/main.js`,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: TARGET_PATH + 'js/[name].[contenthash].bundle.js',
    sourceMapFilename: TARGET_PATH + 'js/[name].[contenthash].bundle.map',
    chunkFilename: TARGET_PATH + 'js/[name].[contenthash].bundle.js',
    publicPath: PUBLIC_PATH
  },
  externals: {
    grecaptcha: 'grecaptcha',
    fcWidget: 'fcWidget'
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        '__VERSION__': JSON.stringify(process.env.APP_VERSION),
        'NODE_ENV': JSON.stringify(NODE_ENV),
        'RECAPTCHA_DISABLED': JSON.stringify(process.env.RECAPTCHA_DISABLED),
        'ANALYTICS_DISABLED': JSON.stringify(process.env.ANALYTICS_DISABLED),
      }
    }),
    new MiniCssExtractPlugin({
      filename: TARGET_PATH + `styles/[name].[contenthash].bundle.css`,
      chunkFilename: TARGET_PATH + `styles/[id].[contenthash].bundle.css`,
    }),
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '/src/templates/index.ejs'),
      inject: 'body',
      filename: 'index.html'
    }),
    //new CleanWebpackPlugin(),
    //new BundleAnalyzerPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.(c|le)ss$/,
				use: [
          'style-loader',
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]'
              },
              importLoaders: 1
            },
          }, {
            loader: 'postcss-loader', // Run post css actions
            options: {
              plugins: function () { // post css plugins, can be exported to postcss.config.js
                return [
                  require('autoprefixer')
                ]
              }
            }
          },
					'less-loader'
				]
			},
      {
        test: /\.(svg|png|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          outputPath: TARGET_PATH + 'images/'
        }
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          outputPath: TARGET_PATH + 'fonts/'
        }
      }
    ]
  }
}
