'use strict'

import PageView from 'view/page/hostgroup'
import App from 'ampersand-app'

function Route () {
}

Route.prototype = {
  route () {
    var page = this.index()

    App.currentPage = page
  },
  index () {
    // webhooks collection
    App.state.hostGroups.fetch()
    App.state.hosts.fetch()

    const selector = 'body .main-container [data-hook=page-container]'
    const container = document.querySelector(selector)

    return new PageView({
      el: container,
      collection: App.state.hostGroups
    })
  }
}

module.exports = Route
