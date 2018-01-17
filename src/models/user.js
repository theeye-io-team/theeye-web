import some from 'lodash/some'

import State from 'ampersand-state'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
// import config from 'config'

import { Collection as Customers } from 'models/customer'

// const urlRoot = `${config.app_url}/user` // sails users

const NotificationSettings = State.extend({
  props: {
    mute: ['boolean',false,false],
    push: ['boolean',false,true],
    email: ['boolean',false,true],
    desktop: ['boolean',false,true],
    desktopExcludes: ['array',false,() => { return [] }]
  },
  getExclusionFilter (FILTER) {
    return some(this.desktopExcludes, FILTER)
  }
})

const Model = AppModel.extend({
  props: {
    id: 'string',
    username: 'string',
    credential: 'string',
    email: 'string',
    enabled: ['boolean', false, false],
    invitation_token: 'string',
    createdAt: 'date',
    updatedAt: 'date',
    //notifications: ['object', true, () => {
    //  return {
    //  }
    //}]
  },
  children: {
    notifications: NotificationSettings
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
  },
})

const Collection = AppCollection.extend({
  //url: urlRoot,
  model: Model
})

exports.Model = Model
exports.Collection = Collection
