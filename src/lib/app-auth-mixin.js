'use strict'

const App = require('ampersand-app')

module.exports = {
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
        withCredentials: false
      }
    }
  }
}
