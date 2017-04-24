'use strict'

import WebhookPageView from 'view/page/webhook'
import App from 'ampersand-app'

function Controller () {
}

Controller.prototype = {
  route () {
    var page = this.index()

    App.currentPage = page
  },
  index () {
    // webhooks collection
    App.state.webhooks.fetch()

    const selector = 'body .main-container [data-hook=page-container]'
    const container = document.querySelector(selector)

    return new WebhookPageView({
      el: container,
      collection: App.state.webhooks
    })
  }
}

module.exports = Controller
