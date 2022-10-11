import App from 'ampersand-app'
import State from 'ampersand-state'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'

import { Model as Customer } from 'models/customer'

const urlRoot = function () {
  return `${config.supervisor_api_url}/${App.state.session.customer.name}/host`
}

export const Model = AppModel.extend({
  urlRoot,
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
    customer: Customer
  }
})

export const Collection = AppCollection.extend({
  model: Model,
  url: urlRoot
})
