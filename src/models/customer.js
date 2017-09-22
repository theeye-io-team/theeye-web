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

export const Model = AppModel.extend({
  urlRoot: urlRoot,
  props: {
    id: 'string',
    name: 'string',
    description: 'string',
    emails: ['array', false, () => { return [] }],
    config: ['object', false, () => { return Object.assign({}, defaultConfig) }],
    creation_date: 'date',
		last_update: 'date'
  },
  derived: {
    formatted_tags: {
      deps: ['name','description','emails'],
      fn () {
        return [
          'name=' + this.name,
          'description=' + this.description,
          'emails=' + this.emails.join(', ')
        ]
      }
    }
  },
  parse(attrs) {
    attrs.config = Object.assign({}, defaultConfig, attrs.config)
    return attrs
  }
})

export const Collection = AppCollection.extend({
  url: urlRoot,
  model: Model
})
