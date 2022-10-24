'use strict'

import PageView from 'view/page/hostgroup'
import App from 'ampersand-app'
import Route from 'lib/router-route'

class HostGroup extends Route {
  indexRoute () {
    App.state.hostGroupPage.resetCollection()

    // webhooks collection
    App.state.hostGroups.fetch()
    App.state.hosts.fetch()
    App.state.resources.fetch()

    return new PageView({
      collection: App.state.hostGroups
    })
  }
}

export default HostGroup
