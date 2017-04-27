import BaseModel from './model'
import AmpersandRestCollection from 'ampersand-rest-collection'

export const Model = BaseModel.extend({
  props: {
    id: 'string',
    _id: 'string',
    name: 'string',
    data: 'object',
    type: 'string',
    priority: 'number',
    nextRunAt: 'date'
    // lastModifiedBy: '' // ???
  }
})

export const Collection = AmpersandRestCollection.extend({
  model: Model,
  url: '/api/schedule'
})
