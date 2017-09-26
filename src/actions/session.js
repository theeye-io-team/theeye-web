import App from 'ampersand-app'
import XHR from 'lib/xhr'
const config = require('config')

module.exports = {
  changeCustomer (name) {
    App.state.loader.visible = true

    XHR.send({
      method: 'post',
      url: `${config.app_url}/session/customer/${name}`,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (data,xhr) => {
        App.state.loader.visible = false
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        bootbox.alert('Operation failed. Please refresh')
        console.error(arguments)
      }
    })
  }
}
