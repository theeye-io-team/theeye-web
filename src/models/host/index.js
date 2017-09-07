import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

import { Model as Customer } from 'models/customer'

const urlRoot = '/api/host'

const Model = AppModel.extend({
  urlRoot: urlRoot,
	props: {
    id: 'string',
		customer_name: 'string',
		customer_id: 'string',
		hostname: 'string',
		ip: 'string',
		os_name: 'string',
		os_version: 'string',
		agent_version: 'string',
		creation_date: 'date',
		last_update: 'date',
		enable: 'boolean',
	},
  children: {
    customer: Customer,
  }
})

const Collection = AppCollection.extend({
  model: Model,
  url: urlRoot
})

exports.Model = Model
exports.Collection = Collection
