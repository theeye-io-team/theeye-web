import UserPage from 'view/page/user'
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import Route from 'lib/router-route'
import bootbox from 'bootbox'

class User extends Route {
  indexRoute () {
   App.state.admin.users.fetch({
     error (err,xhr) {
       bootbox.alert('Something goes wrong. Please refresh')
     }
   })
   const page = new UserPage({
     collection: App.state.admin.users
   })
   return page
  }
}

export default User
