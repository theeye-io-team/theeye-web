import App from 'ampersand-app'
import AppCollection from 'lib/app-collection'
import Schema from './schema'
import config from 'config'

const urlRoot = function () {
  return `${config.supervisor_api_url}/${App.state.session.customer.name}/script`
}

export const Model = Schema.extend({
  urlRoot: urlRoot,
  props: {
    _type: ['string',true,'Script']
  }
})

export const Collection = AppCollection.extend({
  comparator: 'summary',
  model: Model,
  url: urlRoot,
})
