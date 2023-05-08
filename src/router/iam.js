import App from 'ampersand-app'
import Route from 'lib/router-route'
import IAMPageView from 'view/page/iam'
import qs from 'qs'

import { Groups } from 'state/iam'

class IAM extends Route {
  indexRoute () {
    const iam = new IAMPageView({
      current_tab: qs.parse(window.location.search, {ignoreQueryPrefix: true}).tab
    })
    return iam
  }
}

export default IAM
