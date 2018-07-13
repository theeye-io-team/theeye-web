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
    tags: 'array',
    source_model_id: 'string', // temporal , is used to create templates
    hostgroup_id: ['string', false, null] // only if belongs to
	},
  children: {
    customer: Customer,
    user: User,
  },
  derived: {
    summary: {
      deps: ['hostname','name'],
      fn () {
        return `[${this.hostname}] ${this.type} monitor ${this.name}`
      }
    }
  }
})
