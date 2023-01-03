import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'

const urlRoot = function () {
  return `${config.api_url}/admin/customer`
}


const Model = AppModel.extend({
  urlRoot,
  props: {
    id: 'string',
    name: 'string',
    display_name: 'string',
    description: 'string',
    config: 'object',
    creation_date: 'date',
    last_update: 'date'
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

const Collection = AppCollection.extend({
  indexes: ['name','display_name'],
  url: urlRoot,
  model: Model,
  comparator: 'display_name'
})

export { Model, Collection }
