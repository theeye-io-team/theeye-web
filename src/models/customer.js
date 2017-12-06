import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'

const urlRoot = `${config.app_url}/customer`

const defaultConfig = {
  kibana: null,
  elasticsearch: {
    enabled: false,
    url: ''
  }
}

const Model = AppModel.extend({
  urlRoot: urlRoot,
  props: {
    id: 'string',
    name: 'string',
    description: 'string',
    config: ['object', false, () => { return Object.assign({}, defaultConfig) }],
    creation_date: 'date',
		last_update: 'date'
  },
  derived: {
    formatted_tags: {
      deps: ['name','description'],
      fn () {
        return [
          'name=' + this.name,
          'description=' + this.description
        ]
      }
    }
  },
  parse(attrs) {
    attrs.config = Object.assign({}, defaultConfig, attrs.config)
    return attrs
  }
})

const Collection = AppCollection.extend({
  url: urlRoot,
  model: Model
})

exports.Model = Model
exports.Collection = Collection
