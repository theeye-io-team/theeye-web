import CustomerPage from 'view/page/customer'
import App from 'ampersand-app'
import Route from 'lib/router-route'
import bootbox from 'bootbox'

class Customer extends Route {
  indexRoute () {
    App.state.admin.customers.fetch({
      error (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      }
    })
    const page = new CustomerPage({
      collection: App.state.admin.customers
    })
    return page
  }
}

export default Customer
