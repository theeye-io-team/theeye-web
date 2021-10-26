import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'

import { Model as Customer } from 'models/customer'

const urlRoot = function () {
  return `${config.supervisor_api_url}/tag`
}

const Model = AppModel.extend({
  urlRoot,
  props: {
    id: 'string',
    name: 'string',
    customer_id: 'string',
		creation_date: 'date'
  },
  children: {
    customer: Customer
  }
})

const Collection = AppCollection.extend({
  indexes: ['name'],
  url: urlRoot,
  model: Model
})

export { Collection, Model }
