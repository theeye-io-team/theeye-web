var AmpersandModel = require('ampersand-model')
var AuthMixin = require('./app-auth-mixin')

module.exports = AmpersandModel.extend({
	dataTypes: {
		collection: {
			set: function (newVal) {
				return {
					val: newVal,
					type: newVal && newVal.isCollection ? 'collection' : typeof newVal
				};
			},
			compare: function (currentVal, newVal) {
				return currentVal === newVal;
			}
		}
	},
},AuthMixin)
