import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import { Collection as PolicyCollection } from './policy'

const urlRoot = function () {
  return `${App.config.api_url}/group`
}

const Model = AppModel.extend({
  urlRoot,
  props: {
    id: 'string',
    name: 'string',
    customer: 'string',
    customer_id: 'string',
    members: 'array'
  },
  collections: {
    policies: PolicyCollection
  }
})

const Collection = AppCollection.extend({
  url: urlRoot,
  indexes: ['id','name'],
  model: Model
})

export { Model, Collection }