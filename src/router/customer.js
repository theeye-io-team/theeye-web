import CustomerPage from 'view/page/customer'
import App from 'ampersand-app'

function Route () {
}

Route.prototype = {
  route () {
    this.index()
  },
  index () {
    renderPage()
    App.state.customers.fetch({
      error (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      }
    })
  }
}

const renderPage = () => {
  const selector = 'body .main-container [data-hook=page-container]'
  const container = document.querySelector(selector)
  const page = new CustomerPage({
    el: container,
    collection: App.state.customers
  })
  App.currentPage = page
}

module.exports = Route
