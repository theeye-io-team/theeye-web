import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

const Model = AppModel.extend({
  props: {
    id: 'string',
    emitter_id: 'string',
    //emitter: 'emitter',
    emitter: 'object',
		name: 'string',
    creation_date: 'date',
    last_update: 'date',
    enable: 'boolean',
    secret: 'string',
    customer_id: 'string',
  },
  derived: {
    description: {
      deps: ['emitter'],
    }
  },
})

const Collection = AppCollection.extend({ model: Model })

exports.Collection = Collection
exports.Model = Model
