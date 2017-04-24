import BaseModel from './model'
import AmpersandRestCollection from 'ampersand-rest-collection'

export const Model = BaseModel.extend({
  //urlRoot: '/api/customer',
  props: {
    id:'string',
    name:'string',
    description:'string',
    emails:['array',false,() => { return [] }],
    config:['object',false,() => { return {} }],
    creation_date:'date'
  }
})

export const Collection = AmpersandRestCollection.extend({
  model: Model,
  //url:'/api/customer'
})
