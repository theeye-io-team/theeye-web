import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

import { Collection as Customers } from 'models/customer'

const urlRoot = '/user' // sails users

export const Model = AppModel.extend({
  //urlRoot: urlRoot,
  props: {
    id: 'string',
    username: 'string',
    credential: 'string',
    email: 'string',
    enabled: ['boolean', false, false],
    invitation_token: 'string',
    //customers: ['array', false, () => []],
		//creation_date: 'date',
		//last_update: 'date',
    createdAt: 'date',
    updatedAt: 'date'
  },
  derived: {
    formatted_tags: {
      deps: ['username','email','credential','enabled'],
      fn () {
        return [
          'username=' + this.username,
          'email=' + this.email,
          'credential=' + this.credential,
          'enabled=' + this.enabled
        ]
      }
    }
  },
  session: {
    show: ['boolean', false, true],
    selected: ['boolean', false, false]
  },
  collections: {
    customers: Customers
  }
})

export const Collection = AppCollection.extend({
  //url: urlRoot,
  model: Model
})
