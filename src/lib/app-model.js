import App from 'ampersand-app'
import AmpersandModel from 'ampersand-model'

module.exports = AmpersandModel.extend({
  dataTypes: {
    collection: {
      set: function (newVal) {
        return {
          val: newVal,
          type: newVal && newVal.isCollection ? 'collection' : typeof newVal
        };
      },
      compare: function (currentVal, newVal) {
        return currentVal === newVal;
      }
    }
  },
  ajaxConfig () {
    if (!App.state) { return {} }
    if (!App.state.session) { return {} }
    if (!App.state.session.authorization) { return {} }

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
