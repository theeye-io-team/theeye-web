import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'
import merge from 'lodash/merge'

const urlRoot = `${config.app_url}/customer`

const defaultConfig = {
  kibana: {
    enabled: false,
    url: ''
  },
  elasticsearch: {
    enabled: false,
    url: ''
  },
  ngrok: {
    enabled: false,
    address: '',
    authtoken: '',
    protocol: ''
  }
}

const Model = AppModel.extend({
  urlRoot: urlRoot,
  props: {
    id: 'string',
    name: 'string',
    description: 'string',
    config: ['object', true, () => {
      return Object.assign({}, defaultConfig)
    }],
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
      deps: ['name', 'description'],
      fn () {
        return [
          'name=' + this.name,
          'description=' + this.description
        ]
      }
    }
  },
  parse (attrs) {
    // MUTATE kibana config schema
    // special `if`: when Factory parses the value, config is empty
    if (attrs.config) {
      attrs.config.kibana = attrs.config.kibana || defaultConfig.kibana
      if (typeof (attrs.config.kibana) === 'string') {
        attrs.config.kibana = {
          enabled: true,
          url: attrs.config.kibana || ''
        }
      }
    }

    attrs.config = merge({}, defaultConfig, attrs.config)
    return attrs
  }
})

const Collection = AppCollection.extend({
  indexes: ['name'],
  url: urlRoot,
  model: Model,
  comparator: 'name'
})

exports.Model = Model
exports.Collection = Collection
