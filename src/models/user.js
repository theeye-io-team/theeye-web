import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

import { Collection as Customers } from 'models/customer'

const urlRoot = '/api/user'

export const Model = AppModel.extend({
  // urlRoot: urlRoot,
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
  session: {
    show: ['boolean', false, true],
    selected: ['boolean', false, false]
  },
  collections: {
    customers: Customers
  }
})

export const Collection = AppCollection.extend({
  // urlRoot: urlRoot,
  model: Model
})
