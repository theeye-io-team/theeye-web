import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

const urlRoot = '/api/customer'

export const Model = AppModel.extend({
  //urlRoot: urlRoot,
  props: {
    id: 'string',
    name: 'string',
    description: 'string',
    emails: ['array', false, () => { return [] }],
    config: ['object', false, () => { return {} }],
    creation_date: 'date',
		last_update: 'date'
  }
})

export const Collection = AppCollection.extend({
  //url: urlRoot,
  model: Model
})
