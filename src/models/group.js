import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import { Collection as PolicyCollection } from './policy'

const Model = AppModel.extend({
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
  indexes: ['id','name'],
  Model: Model
})

export { Model, Collection }