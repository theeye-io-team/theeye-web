import App from 'ampersand-app'
import State from 'ampersand-state'
import some from 'lodash/some'

import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'

const urlRoot = `${config.api_url}/admin/user`

const NotificationSettings = State.extend({
  props: {
    mute: ['boolean',false,false],
    push: ['boolean',false,true],
    email: ['boolean',false,true],
    desktop: ['boolean',false,true],
    notificationFilters: ['array',false,() => { return [] }]
  },
  getExclusionFilter (FILTER) {
    return some(this.notificationFilters, FILTER)
  }
})

const Model = AppModel.extend({
  urlRoot,
  props: {
    id: 'string',
    name: 'string',
    username: 'string',
    credential: 'string',
    email: 'string',
    enabled: ['boolean', false, false],
    invitation_token: 'string',
    creation_date: 'date',
    last_update: 'date',
    onboardingCompleted: ['boolean', false, false]
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
      deps: ['name','username','email','credential','enabled'],
      fn () {
        return [
          'name=' + this.name,
          'username=' + this.username,
          'email=' + this.email,
          'credential=' + this.credential,
          'enabled=' + this.enabled,
          'creation_date=' + this.creation_date
        ]
      }
    }
  },
  session: {
    show: ['boolean', false, true],
    selected: ['boolean', false, false]
  },
  //collections: {
  //  customers: function (models, options) {
  //    return new App.Models.Customer.Collection(models, options)
  //  }
  //}
})

const Collection = AppCollection.extend({
  url: urlRoot,
  model: Model
})

export { Model, Collection }
