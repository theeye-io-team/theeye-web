import AppModel from 'lib/app-model'

const User = require('models/user').Model
const Customer = require('models/customer').Model

module.exports = AppModel.extend({
	props: {
    id: 'string',
		user_id: 'string', // owner/creator
		customer_id: 'string',
		customer_name: 'string',
		description: 'string',
		name: 'string',
		type: 'string',
		_type: 'string',
		acl: 'array',
		failure_severity: 'string',
		alerts: 'boolean',
    tags: 'array'
	},
  children: {
    customer: Customer,
    user: User,
  }
})
