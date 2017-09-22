import UserPage from 'view/page/user'
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import Route from 'lib/router-route'
import bootbox from 'bootbox'

class User extends Route {
  indexRoute () {
    /**
     * @summary note that users collection is retrived from sails and customers from
     * the api via a custom sails endpoint.
     * is not being directly consumed from the api because of some routes restriction.
     * until now only root users can fetch data of users and customers directly from
     * the supervisor api.
     */
    App.state.customers.fetch({
      success: () => {
        XHR.send({
          url: `/user`,
          method: 'get',
          //jsonData: body,
          withCredentials: true,
          timeout: 5000,
          headers: { Accept: 'application/json;charset=UTF-8' },
          done (users,xhr) {

            users.forEach(user => {
              // map to object customers
              const customers = user.customers.map(name => {
                return App.state.customers.find(c => c.name == name)
              })
              user.customers = customers
            })

            App.state.users.set(users)
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

    return new UserPage({
      collection: App.state.users
    })
  }
}

module.exports = User
