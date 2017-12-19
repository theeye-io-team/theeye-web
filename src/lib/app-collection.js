import App from 'ampersand-app'
import AmpersandCollection from 'ampersand-rest-collection'
import FilterMixin from './app-loopback-filter-mixin'
import extend from 'lodash/assign'

module.exports = AmpersandCollection.extend(FilterMixin, {
  mainIndex: 'id' ,
  ajaxConfig: function () {
    if (!App.state) return {}
    if (!App.state.session) return {}
    if (!App.state.session.authorization) return {}

    var authorization = App.state.session.authorization
    return {
      headers: {
        Authorization: authorization
      },
      xhrFields: {
        //timeout: 1000,
        withCredentials: true
      }
    }
  }
})
