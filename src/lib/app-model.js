import App from 'ampersand-app'
import AmpersandModel from 'ampersand-model'
import XHR from 'lib/xhr'

export default AmpersandModel.extend({
  props: {
    is_loading: ['boolean', false, false],
    // in sync with the API
    synchronized: ['boolean', false, false]
  },
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
        timeout: App.config.request_timeout,
        withCredentials: true
      }
    }
  },
  sync (method, model, options = {}) {
    const errorFn = (options?.error || (()=>{}))
    const successFn = (options?.success || (()=>{}))

    options = Object.assign({}, options, {
      error: function (respObj, errStr, errMsg) {
        if (respObj.statusCode >= 400) {
          XHR.handleError(respObj.rawRequest, options)
        }
        if (errorFn) {
          errorFn.apply(this, arguments)
        }
      },
      success: function () {
        model.synchronized = true
        if (successFn) {
          successFn.apply(this, arguments)
        }
      }
    })

    return AmpersandModel.prototype.sync.call(this, method, model, options)
  },
  parse () {
    const attrs = AmpersandModel.prototype.parse.apply(this, arguments)
    attrs.synchronized = true
    return attrs
  }
})
