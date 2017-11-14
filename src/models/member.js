import App from 'ampersand-app'
import BaseModel from 'lib/app-model'
import BaseCollection from 'lib/app-collection'
import config from 'config'

import { Model as User } from './user'
//import { Model as Customer } from './customer'

const urlRoot = `${config.app_url}/member`

const Model = BaseModel.extend({
  urlRoot: urlRoot,
  props: {
    id: 'string',
    user_id: 'string',
    credential: 'string'
  },
  children: {
    user: User
  },
  derived: {
    label: {
      deps: ['user'],
      fn () {
        return `${this.user.username}, ${this.user.email} (${this.user.credential})`
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

const Collection = BaseCollection.extend({
  url: urlRoot,
  model: Model
})

exports.Model = Model
exports.Collection = Collection
