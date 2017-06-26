var app = require('ampersand-app')

module.exports = {
  ajaxConfig: function () {
    if (!app.state) return {}
    if (!app.state.session) return {}
    if (!app.state.session.access_token) return {}

    var accessToken = app.state.session.access_token
    return {
      headers: {
        Authorization: accessToken
      },
      xhrFields: {
        withCredentials: true
      }
    }
  }
}
