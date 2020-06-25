import App from 'ampersand-app'
import AppCollection from 'lib/app-collection'
import Schema from './schema'
import config from 'config'

const urlRoot = function () {
  return `${config.supervisor_api_url}/${App.state.session.customer.name}/file`
}

export const Model = Schema.extend({
  urlRoot,
  props: {
    _type: ['string', false, 'File']
  }
})

export const Collection = AppCollection.extend({
  comparator: 'filename',
  model: Model,
  url: urlRoot,
})
