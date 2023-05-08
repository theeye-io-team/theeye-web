import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

const urlRoot = function () {
  return `${App.config.api_url}/group`
}

const Model = AppModel.extend({
  urlRoot,
  props: {
    builtIn: ['boolean', false, false],
    id: 'string',
    name: 'string',
    description: 'string',
    customer: 'string',
    customer_id: 'string',
    credential: 'string'
  }
})

const Collection = AppCollection.extend({
  url: urlRoot,
  indexes: ['id','name'],
  model: Model
})

export { Model, Collection }
