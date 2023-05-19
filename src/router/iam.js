import App from 'ampersand-app'
import Route from 'lib/router-route'
import IAMPageView from 'view/page/iam'
import qs from 'qs'
import BasicRoles from 'models/iam/roles'

class IAM extends Route {
  indexRoute () {
    App.state.supcatalog.fetch()
    App.state.roles.fetch({
      success () {
        for (let role of BasicRoles) {
          App.state.roles.add(role)
        }
      }
    })

    const iam = new IAMPageView({
      current_tab: qs.parse(window.location.search, {ignoreQueryPrefix: true}).tab
    })
    return iam
  }
}

export default IAM
