import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
//import { Model as Customer } from 'models/customer'
//import EventEmitterFactory from './factory'
//const urlRoot = '/api/event'

export const Model = AppModel.extend({
  //dataTypes: {
  //  emitter: {
  //    set (newVal) {
  //      try {
  //        var val = new EventEmitterFactory(newVal)
  //        return {
  //          val: val,
  //          type: 'emitter'
  //        }
  //      } catch (parseError) {
  //        return {
  //          val: newVal,
  //          type: typeof newVal
  //        }
  //      }
  //    }
  //  }
  //},
  //urlRoot: urlRoot,
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
  //children: {
  //  customer: Customer,
  //}
})

export const Collection = AppCollection.extend({
  //urlRoot: urlRoot,
  model: Model
})
