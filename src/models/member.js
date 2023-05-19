import App from 'ampersand-app'
import BaseModel from 'lib/app-model'
import BaseCollection from 'lib/app-collection'
import config from 'config'

import { Model as User } from './user'
//import { Model as Customer } from './customer'

const urlRoot = `${config.api_url}/member`
const adminUrlRoot = `${config.api_url}/admin/member`

export const Model = BaseModel.extend({
  urlRoot: urlRoot,
  props: {
    id: 'string',
    user_id: 'string',
    credential: 'string',
    roles: 'array',
    customer_id: 'string'
  },
  children: {
    user: User
  },
  derived: {
    label: {
      deps: ['user'],
      fn () {
        return `${this.user.username}, ${this.user.email} (${this.credential})`
      }
    },
    name: {
      deps: ['user'],
      fn () {
        return this.user.name
      }
    },
    email: {
      deps: ['user'],
      fn () {
        return this.user.email
      }
    },
    username: {
      deps: ['user'],
      fn () {
        return this.user.username
      }
    }
  }
})

export const Collection = BaseCollection.extend({
  url: urlRoot,
  model: Model
})

export const AdminCollection = BaseCollection.extend({
  url: adminUrlRoot,
  model: Model
})
