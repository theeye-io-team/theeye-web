import CustomerPage from 'view/page/customer'
import App from 'ampersand-app'
import Route from 'lib/router-route'

class Customer extends Route {
  indexRoute () {
    App.state.customers.fetch({
      error (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      }
    })
    const page = new CustomerPage({
      collection: App.state.customers
    })
    return page
  }
}

module.exports = Customer
