'use strict'

import WebhookPageView from 'view/page/webhook'
import App from 'ampersand-app'
import Route from 'lib/router-route'

class Webhook extends Route {
  indexRoute () {
    // webhooks collection
    App.state.webhooks.fetch()
    return new WebhookPageView({
      collection: App.state.webhooks
    })
  }
}

module.exports = Webhook
