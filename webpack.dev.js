const common = require('./webpack.common')

module.exports = Object.assign({}, common, {
  mode: 'development',
  //devtool: 'source-map',
  devtool: '#inline-source-map',
})
