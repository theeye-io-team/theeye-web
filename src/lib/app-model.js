import App from 'ampersand-app'
import AmpersandModel from 'ampersand-model'
import XHR from 'lib/xhr'

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
  },
  sync (method, model, options) {
    let errorFn = options ? options.error : (()=>{})

    options = Object.assign({}, (options||{}), {
      error: function (respObj, errStr, errMsg) {
        if (respObj.statusCode >= 400) {
          XHR.handleError(respObj.rawRequest, options)
        }
        if (errorFn) { errorFn.call(this, arguments) }
      }
    })

    return AmpersandModel.prototype.sync.call(this, method, model, options)
  }
})
