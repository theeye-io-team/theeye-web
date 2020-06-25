import MembersPage from 'view/page/member'
import App from 'ampersand-app'
import Route from 'lib/router-route'
import bootbox from 'bootbox'

class Member extends Route {
  indexRoute () {
    App.state.admin.users.fetch()
    App.state.admin.customers.fetch()
    App.state.admin.members.fetch({
      error (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      }
    })
    const page = new MembersPage({
      collection: App.state.admin.customers
    })
    return page
  }
}

export default Member
