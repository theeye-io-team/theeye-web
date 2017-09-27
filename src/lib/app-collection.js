var AmpersandCollection = require('ampersand-rest-collection')
var FilterMixin = require('./app-loopback-filter-mixin')
var AuthMixin = require('./app-auth-mixin')
var extend = require('lodash/assign')

module.exports = AmpersandCollection.extend(
  FilterMixin, AuthMixin, { mainIndex: 'id' }
)
