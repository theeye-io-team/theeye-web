import App from 'ampersand-app'
import XHR from 'lib/xhr'
const config = require('config')

module.exports = {
  changeCustomer (id) {
    const customer = App.state.session.user.customers.get(id)
    if (customer.id==App.state.session.customer.id) return

    App.state.loader.visible = true
    XHR.send({
      method: 'post',
      url: `${config.app_url}/session/customer/${customer.name}`,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (data,xhr) => {
        App.state.loader.visible = false
        // replace current customer
        App.state.session.customer.clear()
        App.state.session.customer.set( customer.serialize() )
        App.state.reset()
        App.Router.reload()
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        bootbox.alert('Operation failed. Please refresh')
        console.error(arguments)
      }
    })
  }
}
