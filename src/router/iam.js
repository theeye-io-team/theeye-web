import App from 'ampersand-app'
import Route from 'lib/router-route'
import IAMPageView from 'view/page/iam'
import qs from 'qs'

class IAM extends Route {
  indexRoute () {
    App.state.supcatalog.fetch()
    const iam = new IAMPageView({
      current_tab: qs.parse(window.location.search, {ignoreQueryPrefix: true}).tab
    })
    return iam
  }
}

export default IAM
