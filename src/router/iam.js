import App from 'ampersand-app'
import Route from 'lib/router-route'
import IAMPageView from 'view/page/iam'

class IAM extends Route {
  indexRoute () {
    App.state.groups.fetch()
    App.state.policies.fetch()
    App.state.members.fetch()

    const iam = new IAMPageView()
    //return iam
  }
}

export default IAM
