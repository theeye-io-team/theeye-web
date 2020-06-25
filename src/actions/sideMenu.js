import App from 'ampersand-app'

export default {
  customerSearch (input) {
    if (input === App.state.sideMenu.customerSearch) {
      return
    }
    App.state.sideMenu.customerSearch = input
  },
  clearCustomerSearch () {
    App.state.sideMenu.customerSearch = ''
  }
}
