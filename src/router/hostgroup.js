'use strict'

import PageView from 'view/page/hostgroup'
import App from 'ampersand-app'
import Route from 'lib/router-route'

class HostGroup extends Route {
  indexRoute () {
    // webhooks collection
    App.state.hostGroups.fetch()
    App.state.hosts.fetch()

    return new PageView({
      collection: App.state.hostGroups
    })
  }
}

module.exports = HostGroup
