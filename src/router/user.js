// Special scenario where we don't have access to the API
// (api/user points to users collection, we needed web_users collection)
// so we instantiate a default AmpersandCollection (not Rest) and fill it with UserModel's
// created from the "global" var users thrown on the ejs view.
// TODO: The UserModel has been ripped of the urlRoot property till we implement
// a more elegant solution
import UserPage from 'view/page/user'
import App from 'ampersand-app'

function Route () {
}

Route.prototype = {
  route () {
    var page = this.index()

    App.currentPage = page
  },
  index () {
    //const protocols = window.Protocols

    // collecting value from global var. TODO: improve this!
    App.state.customers.set(window.Customers)

    const users = window.Users
    users.forEach(function(user){
      // map to object customers
      const customers = user.customers.map(name => {
        return App.state.customers.find(c => c.name == name)
      })
      user.customers = customers
    })
    App.state.users.set(users)


    // instantiate and render on element
    return new UserPage({
      el: document.getElementById('user-page'),
      collection: App.state.users
      //protocols: protocols
    })
  }
}

module.exports = Route
