import UserPage from 'view/page/user'
import App from 'ampersand-app'
import XHR from 'lib/xhr'

function Route () {
}

Route.prototype = {
  route () {
    this.index()
  },
  index () {
    /**
     * @summary note that users collection is retrived from sails and customers from
     * the api via a custom sails endpoint.
     * is not being directly consumed from the api because of some routes restriction.
     * until now only root users can fetch data of users and customers directly from
     * the supervisor api.
     */
    App.state.customers.fetch({
      success: () => {
        XHR({
          url: `/user`,
          method: 'get',
          //jsonData: body,
          withCredentials: true,
          timeout: 5000,
          headers: { Accepts: 'application/json;charset=UTF-8' },
          done (users,xhr) {

            users.forEach(user => {
              // map to object customers
              const customers = user.customers.map(name => {
                return App.state.customers.find(c => c.name == name)
              })
              user.customers = customers
            })

            App.state.users.set(users)
            renderPage()
          },
          fail (err,xhr) {
            bootbox.alert('Something goes wrong. Please refresh')
          }
        })
      },
      error (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      }
    })
  }
}

const renderPage = () => {
  const selector = 'body .main-container [data-hook=page-container]'
  const container = document.querySelector(selector)
  const page = new UserPage({
    el: container,
    collection: App.state.users
  })
  App.currentPage = page
}

module.exports = Route
