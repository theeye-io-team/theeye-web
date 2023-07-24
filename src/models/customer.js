import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'
import AmpCollection from 'ampersand-collection'

import State from 'ampersand-state'

const urlRoot = function () {
  return `${config.api_url}/admin/customer`
}

export const Model = AppModel.extend({
  urlRoot,
  props: {
    id: 'string',
    name: 'string',
    alias: 'string',
    logo: 'string',
    http_origins: ['array',false, () => { return [] }],
    display_name: 'string',
    description: 'string',
    config: ['object', false, () => { return {} }],
    //config: 'state',
    creation_date: 'date',
    last_update: 'date',
    tags: ['array', false, () => { return [] }],
  },
  collections: {
    tokens: function (models, options) {
      return new App.Models.Token.Collection(models, options)
    }
  },
  derived: {
    formatted_tags: {
      deps: ['name'],
      fn () {
        return [
          'name=' + this.name,
          'display_name=' + this.display_name,
          'description=' + this.description,
          'id=' + this.id,
          'creation_date=' + this.creation_date
        ]
      }
    },
    view_name: {
      deps: ['name','display_name'],
      fn () {
        return (this.display_name || this.name)
      }
    },
    formatted_name: {
      deps: ['name','display_name'],
      fn () {
        if (this.display_name) {
          return `${this.display_name} [${this.name}]`
        }
        return this.name
      }
    }
  }
})

export const Collection = AppCollection.extend({
  indexes: ['name','display_name'],
  url: urlRoot,
  model: Model,
  comparator: 'display_name'
})
