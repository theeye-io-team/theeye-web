import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'

const Model = AppModel.extend({
  urlRoot () {
    let _id = App.state.session.customer.id
    return `${config.api_v3_url}/customer/${_id}/token`
  },
  props: {
    token: 'string',
    username: 'string'
  }
})

const Collection = AppCollection.extend({
  url () {
    let _id = App.state.session.customer.id
    return `${config.api_v3_url}/customer/${_id}/token`
  },
  model: Model
})

exports.Model = Model
exports.Collection = Collection
