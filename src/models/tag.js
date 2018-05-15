import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'

import { Model as Customer } from 'models/customer'

const urlRoot = `${config.api_url}/tag` // sails users

const Model = AppModel.extend({
  urlRoot: urlRoot,
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

exports.Collection = Collection
exports.Model = Model
