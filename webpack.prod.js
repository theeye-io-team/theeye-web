const common = require('./webpack.common')
const TerserPlugin = require('terser-webpack-plugin');

module.exports = Object.assign({}, common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [ new TerserPlugin() ]
  }
})
