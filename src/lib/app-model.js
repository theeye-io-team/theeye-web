var AmpersandModel = require('ampersand-model')
var AuthMixin = require('./app-auth-mixin')

module.exports = AmpersandModel.extend(AuthMixin)
