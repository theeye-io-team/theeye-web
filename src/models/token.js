import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'

const urlRoot = function () {
  return `${config.api_url}/token`
}

const Model = AppModel.extend({
  urlRoot,
  props: {
    id: 'string', // TOKEN ID: id of the member model for this integration
    token: 'string',
    username: 'string'
  }
})

const Collection = AppCollection.extend({
  url: urlRoot,
  model: Model
})

export { Model, Collection }
