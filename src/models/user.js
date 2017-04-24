import BaseModel from './model'
import AppCollection from 'ampersand-rest-collection'

export const Model = BaseModel.extend({
  // urlRoot:'/api/user',
  parse: function (response) {
    return response
  },
  initialize: function () {
    // constructor
    return this
  },
  props: {
    id: 'string',
    username: 'string',
    credential: 'string',
    email: 'string',
    enabled: ['boolean', false, false],
    invitation_token: 'string',
    customers: ['array', false, () => []],
    createdAt: 'date',
    updatedAt: 'date'
  },
  session: {
    show: ['boolean', false, true],
    selected: ['boolean', false, false]
  }
})

export const Collection = AppCollection.extend({
  model: Model,
  url: '/api/user'
})
