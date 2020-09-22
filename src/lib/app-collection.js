import App from 'ampersand-app'
import AmpersandCollection from 'ampersand-rest-collection'
import FilterMixin from './app-filter-mixin'

export default AmpersandCollection.extend(FilterMixin, {
  mainIndex: 'id' ,
  ajaxConfig () {
    if (!App.state) return {}
    if (!App.state.session) return {}
    if (!App.state.session.authorization) return {}

    var authorization = App.state.session.authorization
    return {
      headers: {
        Authorization: authorization
      },
      xhrFields: {
        timeout: App.config.request_timeout,
        withCredentials: true
      }
    }
  }
})
